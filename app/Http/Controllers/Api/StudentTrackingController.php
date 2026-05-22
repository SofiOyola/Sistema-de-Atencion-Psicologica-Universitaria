<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\JsonResponse;
use Throwable;

class StudentTrackingController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    public function show(int $studentId): JsonResponse
    {
        try {
            // Verificar existencia
            $student = $this->neo4j->run(
                "MATCH (e:Estudiante {id_estudiante: \$id}) RETURN e",
                ['id' => $studentId]
            );
            if ($student->count() === 0) {
                return response()->json(['message' => 'Estudiante no encontrado.'], 404);
            }

            // Obtener citas
            $citas = $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$id})-[:SOLICITA]->(c:Cita)
                OPTIONAL MATCH (p:Psicologo)-[:ATIENDE]->(c)
                RETURN c.id_cita AS id, c.fecha AS date, c.hora AS time,
                       c.estado_cita AS status, c.motivo_consulta AS reason,
                       p.nombre AS psychologist
                ORDER BY c.fecha DESC, c.hora DESC
            ", ['id' => $studentId]);

            $appointments = [];
            foreach ($citas as $row) {
                $appointments[] = [
                    'id' => $row->get('id'),
                    'date' => $row->get('date'),
                    'time' => $row->get('time'),
                    'status' => $row->get('status'),
                    'reason' => $row->get('reason'),
                    'psychologist' => $row->get('psychologist'),
                ];
            }

            // Obtener última emoción y notas
            $ultimoEstado = $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$id})-[:REPORTA]->(s:Estado_Emocional)
                RETURN s.nivel_emocional AS emotion, s.fecha_est AS date
                ORDER BY s.fecha_est DESC LIMIT 1
            ", ['id' => $studentId]);

            $lastEmotion = null;
            if ($ultimoEstado->count() > 0) {
                $lastEmotion = [
                    'emotion' => $ultimoEstado->first()->get('emotion'),
                    'date' => $ultimoEstado->first()->get('date'),
                ];
            }

            return response()->json([
                'studentId' => $studentId,
                'appointments' => $appointments,
                'lastEmotion' => $lastEmotion,
            ]);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Error al cargar seguimiento.'], 500);
        }
    }
}