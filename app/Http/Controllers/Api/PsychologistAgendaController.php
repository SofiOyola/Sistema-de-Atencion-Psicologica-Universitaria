<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PsychologistAgendaController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/psychologist/agenda
     * Todas las citas del psicólogo (sin importar la fecha).
     */
    public function index(Request $request)
    {
        $psychologistId = $request->user()->psychologist_id;

        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE]->(c:Cita)
            OPTIONAL MATCH (e:Estudiante)-[:SOLICITA]->(c)
            RETURN c.id_cita AS id,
                   c.fecha AS date,
                   c.hora AS time,
                   e.nombre AS studentName,
                   c.motivo_consulta AS reason,
                   c.estado_cita AS status,
                   COALESCE(c.modalidad, 'Presencial') AS modality,
                   COALESCE(c.consultorio, 'Consultorio 1') AS room
            ORDER BY c.fecha DESC, c.hora DESC
        ", ['id' => $psychologistId]);

        $citas = [];
        foreach ($result as $row) {
            $citas[] = [
                'id'          => $row->get('id'),
                'date'        => $row->get('date'),
                'time'        => $row->get('time'),
                'studentName' => $row->get('studentName'),
                'reason'      => $row->get('reason'),
                'status'      => $row->get('status'),
                'modality'    => $row->get('modality'),
                'room'        => $row->get('room'),
            ];
        }

        return response()->json(['success' => true, 'data' => $citas]);
    }

    /**
     * GET /api/psychologist/agenda/day?fecha=YYYY-MM-DD
     * Citas de una fecha específica.
     */
    public function byDay(Request $request)
    {
        $psychologistId = $request->user()->psychologist_id;
        $fecha = $request->query('fecha', date('Y-m-d'));

        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE]->(c:Cita)
            WHERE c.fecha = \$fecha
            OPTIONAL MATCH (e:Estudiante)-[:SOLICITA]->(c)
            RETURN c.id_cita AS id,
                   c.hora AS time,
                   e.nombre AS studentName,
                   c.motivo_consulta AS reason,
                   c.estado_cita AS status,
                   COALESCE(c.modalidad, 'Presencial') AS modality,
                   COALESCE(c.consultorio, 'Consultorio 1') AS room
            ORDER BY c.hora
        ", ['id' => $psychologistId, 'fecha' => $fecha]);

        $citas = [];
        foreach ($result as $row) {
            $citas[] = [
                'id'          => $row->get('id'),
                'time'        => $row->get('time'),
                'studentName' => $row->get('studentName'),
                'reason'      => $row->get('reason'),
                'status'      => $row->get('status'),
                'modality'    => $row->get('modality'),
                'room'        => $row->get('room'),
            ];
        }

        return response()->json(['success' => true, 'data' => $citas]);
    }

    /**
     * PUT /api/psychologist/appointments/{id}/reschedule
     * Reagenda una cita (cambia fecha y hora).
     */
    public function reschedule(Request $request, $id)
    {
        $psychologistId = $request->user()->psychologist_id;

        $validator = Validator::make($request->all(), [
            'date'   => 'required|date',
            'time'   => 'required|date_format:H:i',
            'reason' => 'required|string|min:5|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Verificar que la cita pertenece al psicólogo y no está cancelada/atendida
        $cita = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:ATIENDE]->(c:Cita {id_cita: \$id})
            WHERE NOT c.estado_cita IN ['Cancelada', 'Atendida']
            RETURN c
        ", ['psychologistId' => $psychologistId, 'id' => $id]);

        if ($cita->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cita no encontrada o no editable.',
            ], 404);
        }

        // Actualizar la cita
        $this->neo4j->run("
            MATCH (c:Cita {id_cita: \$id})
            SET c.fecha = \$date,
                c.hora = \$time,
                c.estado_cita = 'Confirmada',
                c.motivo_reagendamiento = \$reason
            RETURN c
        ", [
            'id'     => $id,
            'date'   => $request->input('date'),
            'time'   => $request->input('time'),
            'reason' => $request->input('reason'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cita reagendada correctamente.',
        ]);
    }

    /**
     * PUT /api/psychologist/appointments/{id}/cancel
     * Cancela una cita (cambia estado a 'Cancelada').
     */
    public function cancel(Request $request, $id)
    {
        $psychologistId = $request->user()->psychologist_id;

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|min:5|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Verificar que la cita pertenece al psicólogo y está activa
        $cita = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:ATIENDE]->(c:Cita {id_cita: \$id})
            WHERE NOT c.estado_cita IN ['Cancelada', 'Atendida']
            RETURN c
        ", ['psychologistId' => $psychologistId, 'id' => $id]);

        if ($cita->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cita no encontrada o ya cancelada/atendida.',
            ], 404);
        }

        $this->neo4j->run("
            MATCH (c:Cita {id_cita: \$id})
            SET c.estado_cita = 'Cancelada',
                c.motivo_cancelacion = \$reason
        ", ['id' => $id, 'reason' => $request->input('reason')]);

        return response()->json([
            'success' => true,
            'message' => 'Cita cancelada correctamente.',
        ]);
    }

    /**
     * GET /api/psychologist/agenda/blocks?date=YYYY-MM-DD
     * Bloqueos del psicólogo (opcional filtrar por fecha).
     */
    public function getBlocks(Request $request)
    {
        $psychologistId = $request->user()->psychologist_id;
        $fecha = $request->query('date');

        $query = "
            MATCH (p:Psicologo {id_psicologo: \$id})-[:BLOQUEA]->(b:Bloqueo)
        ";
        $params = ['id' => $psychologistId];

        if ($fecha) {
            $query .= " WHERE b.fecha = \$fecha";
            $params['fecha'] = $fecha;
        }

        $query .= " RETURN b.id_bloqueo AS id, b.fecha AS date, b.hora_inicio AS startTime,
                           b.hora_fin AS endTime, b.motivo AS reason, b.tipo AS type
                    ORDER BY b.hora_inicio";

        $result = $this->neo4j->run($query, $params);

        $blocks = [];
        foreach ($result as $row) {
            $blocks[] = [
                'id'        => $row->get('id'),
                'date'      => $row->get('date'),
                'startTime' => $row->get('startTime'),
                'endTime'   => $row->get('endTime'),
                'reason'    => $row->get('reason'),
                'type'      => $row->get('type'),
            ];
        }

        return response()->json(['success' => true, 'data' => $blocks]);
    }

    /**
     * POST /api/psychologist/agenda/blocks
     * Crea un nuevo bloqueo de espacio.
     */
    public function createBlock(Request $request)
    {
        $psychologistId = $request->user()->psychologist_id;

        $validator = Validator::make($request->all(), [
            'date'      => 'required|date',
            'startTime' => 'required|date_format:H:i',
            'endTime'   => 'required|date_format:H:i|after:startTime',
            'reason'    => 'required|string|min:5|max:500',
            'type'      => 'required|string|in:Reunión,Capacitación,Incapacidad,Evento institucional,Otro',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Verificar cruce de horarios (simplificado)
        $conflict = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE|BLOQUEA]->(evento)
            WHERE (evento:Cita OR evento:Bloqueo)
              AND evento.fecha = \$date
              AND (
                  (evento.hora <= \$endTime AND evento.hora >= \$startTime)
                  OR (evento:Cita AND evento.hora = \$startTime)
                  OR (evento:Bloqueo AND evento.hora_inicio <= \$endTime AND evento.hora_fin >= \$startTime)
              )
            RETURN count(evento) AS conflicts
        ", [
            'id'        => $psychologistId,
            'date'      => $request->input('date'),
            'startTime' => $request->input('startTime'),
            'endTime'   => $request->input('endTime'),
        ])->first()->get('conflicts');

        if ($conflicts > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una cita o bloqueo en ese horario.',
            ], 409);
        }

        // Obtener nuevo ID
        $maxId = $this->neo4j->run("
            MATCH (b:Bloqueo) RETURN coalesce(max(b.id_bloqueo), 0) AS maxId
        ")->first()->get('maxId');

        $newId = $maxId + 1;

        $this->neo4j->run("
            CREATE (b:Bloqueo {
                id_bloqueo: \$id,
                fecha: \$date,
                hora_inicio: \$startTime,
                hora_fin: \$endTime,
                motivo: \$reason,
                tipo: \$type
            })
            WITH b
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})
            CREATE (p)-[:BLOQUEA]->(b)
        ", [
            'id'             => $newId,
            'date'           => $request->input('date'),
            'startTime'      => $request->input('startTime'),
            'endTime'        => $request->input('endTime'),
            'reason'         => $request->input('reason'),
            'type'           => $request->input('type'),
            'psychologistId' => $psychologistId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Espacio bloqueado correctamente.',
        ]);
    }
}