<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;

class PsychologistDashboardController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    public function index(Request $request)
    {
        $psychologistId = $request->user()->psychologist_id;
        $today = date('Y-m-d');

        // Métricas
        $citasHoy = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE]->(c:Cita)
            WHERE c.fecha = \$today
            RETURN count(c) AS total
        ", ['id' => $psychologistId, 'today' => $today])->first()->get('total');

        $pacientesActivos = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:CORRESPONDE]->(a:Asignacion {vigencia: 'Vigente'})
            MATCH (a)<-[:ASIGNA]-(e:Estudiante)
            RETURN count(DISTINCT e) AS total
        ", ['id' => $psychologistId])->first()->get('total');

        $alertasCriticas = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE]->(c:Cita)-[:GENERA]->(n:Nota_Seguimiento)<-[:CONTIENE]-(h:Historial_Clinico)<-[:POSEE]-(e:Estudiante)
            MATCH (e)-[:REPORTA]->(s:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            WHERE a.nivel_alerta = 'Alta' AND a.estado_alerta = 'Activa'
            RETURN count(DISTINCT a) AS total
        ", ['id' => $psychologistId])->first()->get('total');

        $seguimientosPendientes = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE]->(c:Cita {estado_cita: 'Programada'})
            RETURN count(c) AS total
        ", ['id' => $psychologistId])->first()->get('total');

        $stats = [
            'citas_hoy'               => (int) $citasHoy,
            'pacientes_activos'        => (int) $pacientesActivos,
            'alertas_criticas'         => (int) $alertasCriticas,
            'seguimientos_pendientes'  => (int) $seguimientosPendientes,
        ];

        // Agenda del día
        $agendaResult = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE]->(c:Cita)
            WHERE c.fecha = \$today
            OPTIONAL MATCH (e:Estudiante)-[:SOLICITA]->(c)
            RETURN c.id_cita AS id, c.hora AS hora, e.nombre AS estudiante,
                   c.motivo_consulta AS motivo, c.estado_cita AS estado
            ORDER BY c.hora
            LIMIT 10
        ", ['id' => $psychologistId, 'today' => $today]);

        $agenda = [];
        foreach ($agendaResult as $row) {
            $agenda[] = [
                'id'         => $row->get('id'),
                'hora'       => $row->get('hora'),
                'estudiante' => $row->get('estudiante'),
                'motivo'     => $row->get('motivo'),
                'estado'     => $row->get('estado'),
            ];
        }

        // Alertas emocionales activas
        $alertasResult = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:ATIENDE]->(c:Cita)-[:GENERA]->(n:Nota_Seguimiento)<-[:CONTIENE]-(h:Historial_Clinico)<-[:POSEE]-(e:Estudiante)
            MATCH (e)-[:REPORTA]->(s:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            WHERE a.estado_alerta = 'Activa'
            RETURN a.id_alerta AS id, e.nombre AS estudiante, a.nivel_alerta AS riesgo,
                   s.nivel_emocional AS emocion, a.fecha_generacion AS fecha
            ORDER BY a.fecha_generacion DESC
            LIMIT 5
        ", ['id' => $psychologistId]);

        $alertas = [];
        foreach ($alertasResult as $row) {
            $alertas[] = [
                'id'         => $row->get('id'),
                'estudiante' => $row->get('estudiante'),
                'riesgo'     => $row->get('riesgo'),
                'emocion'    => $row->get('emocion'),
                'fecha'      => $row->get('fecha'),
            ];
        }

        // Pacientes recientes
        $pacientesResult = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})-[:CORRESPONDE]->(a:Asignacion)-[:ASIGNA]-(e:Estudiante)
            OPTIONAL MATCH (e)-[:SOLICITA]->(c:Cita)
            WITH e, a, c
            ORDER BY c.fecha DESC, c.hora DESC
            RETURN e.id_estudiante AS id, e.nombre AS nombre, e.programa_academico AS programa,
                   e.semestre AS semestre, e.estado_proceso_psicologico AS estado,
                   collect(c.fecha + ' ' + c.hora)[0] AS ultima_sesion
            LIMIT 5
        ", ['id' => $psychologistId]);

        $pacientes = [];
        foreach ($pacientesResult as $row) {
            $nombre = $row->get('nombre');
            $iniciales = implode('', array_map(fn($n) => mb_substr($n,0,1), explode(' ', $nombre)));
            $pacientes[] = [
                'id'            => $row->get('id'),
                'nombre'        => $nombre,
                'programa'      => $row->get('programa'),
                'semestre'      => $row->get('semestre'),
                'estado'        => $row->get('estado'),
                'ultima_sesion' => $row->get('ultima_sesion') ?? '—',
                'iniciales'     => $iniciales,
                'color'         => '#e07b9a',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => compact('stats', 'agenda', 'alertas', 'pacientes')
        ]);
    }
}