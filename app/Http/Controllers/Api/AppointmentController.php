<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function psychologists(Neo4jService $neo4j)
    {
        $result = $neo4j->run("
            MATCH (p:Psicologo)
            WHERE p.estado = 'Activo'
            RETURN p.id_psicologo AS id,
                   p.nombre AS name,
                   p.especialidad AS specialty,
                   p.experiencia AS experience
            ORDER BY p.nombre
        ");

        $data = [];

        foreach ($result as $record) {
            $data[] = [
                'id' => $record->get('id'),
                'name' => $record->get('name'),
                'specialty' => $record->get('specialty'),
                'experience' => $record->get('experience') . ' años',
                'active' => true,
                'avatar' => null,
            ];
        }

        return response()->json($data);
    }
    public function index(Neo4jService $neo4j)
    {
        $result = $neo4j->run("
            MATCH (e:Estudiante {id_estudiante: 1})-[:SOLICITA]->(c:Cita)<-[:ATIENDE]-(p:Psicologo)
            RETURN DISTINCT c.id_cita AS id,
                c.fecha AS date,
                c.hora AS time,
                c.estado_cita AS status,
                c.motivo_consulta AS reason,
                p.nombre AS psychologist
            ORDER BY c.id_cita DESC
        ");

        $data = [];

        foreach ($result as $record) {
            $data[] = [
                'id' => $record->get('id'),
                'date' => $record->get('date'),
                'time' => $record->get('time'),
                'status' => $record->get('status'),
                'reason' => $record->get('reason'),
                'psychologist' => $record->get('psychologist'),
                'modality' => 'Presencial',
            ];
        }

        return response()->json($data);
    }

    public function store(Request $request, Neo4jService $neo4j)
    {
        $validated = $request->validate([
            'psychologist_id' => 'required',
            'date' => 'required',
            'time' => 'required',
            'reason' => 'required|string',
        ]);

        $result = $neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologist_id})
            MATCH (e:Estudiante {id_estudiante: 1})
            WITH p, e
            MATCH (cita:Cita)
            WITH p, e, coalesce(max(cita.id_cita), 0) + 1 AS newId
            CREATE (c:Cita {
                id_cita: newId,
                fecha: \$date,
                hora: \$time,
                estado_cita: 'Programada',
                motivo_consulta: \$reason
            })
            CREATE (e)-[:SOLICITA]->(c)
            CREATE (p)-[:ATIENDE]->(c)
            RETURN c.id_cita AS id
        ", [
            'psychologist_id' => (int) $validated['psychologist_id'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'reason' => $validated['reason'],
        ]);

        return response()->json([
            'message' => 'Cita creada correctamente',
            'id' => $result->first()->get('id'),
        ], 201);
    }

    public function reschedule($id, Request $request, Neo4jService $neo4j)
    {
        $validated = $request->validate([
            'date' => 'required',
        ]);

        $neo4j->run("
            MATCH (c:Cita {id_cita: \$id})
            SET c.fecha = \$date
            RETURN c
        ", [
            'id' => (int) $id,
            'date' => $validated['date'],
        ]);

        return response()->json([
            'message' => 'Cita reprogramada correctamente'
        ]);
    }

    public function cancel($id, Neo4jService $neo4j)
    {
        $neo4j->run("
            MATCH (c:Cita {id_cita: \$id})
            SET c.estado_cita = 'Cancelada'
            RETURN c
        ", [
            'id' => (int) $id,
        ]);

        return response()->json([
            'message' => 'Cita cancelada correctamente'
        ]);
    }
}