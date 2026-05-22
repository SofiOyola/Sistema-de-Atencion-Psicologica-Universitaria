<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class StudentWellnessController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    public function show(int $studentId): JsonResponse
    {
        try {
            $estados = $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$id})-[:REPORTA]->(s:Estado_Emocional)
                OPTIONAL MATCH (s)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
                RETURN s.id_estado_emocional AS id, s.nivel_emocional AS emotion,
                       s.emoji AS emoji, s.descripcion AS description, s.causa AS cause,
                       s.nivel_estres AS stressLevel, s.fecha_est AS date, s.hora_est AS time,
                       COALESCE(a.estado_alerta, 'Sin alerta') AS alertStatus
                ORDER BY s.fecha_est DESC, s.hora_est DESC
            ", ['id' => $studentId]);

            $records = [];
            foreach ($estados as $row) {
                $records[] = [
                    'id' => $row->get('id'),
                    'emotion' => $row->get('emotion'),
                    'emoji' => $this->mapEmoji($row->get('emoji')),
                    'description' => $row->get('description'),
                    'cause' => $row->get('cause'),
                    'stressLevel' => $row->get('stressLevel'),
                    'date' => $row->get('date'),
                    'time' => $row->get('time'),
                    'alertStatus' => $row->get('alertStatus'),
                ];
            }

            return response()->json([
                'studentId' => $studentId,
                'records' => $records,
            ]);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Error al cargar bienestar emocional.'], 500);
        }
    }

    public function store(Request $request, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'emotion' => ['required', 'string', Rule::in(['Muy bien', 'Bien', 'Regular', 'Mal', 'Muy mal'])],
            'description' => 'required|string|max:500',
            'cause' => 'nullable|string|max:255',
            'stressLevel' => 'nullable|integer|between:1,5',
            'replaceExisting' => 'sometimes|boolean',
        ]);

        try {
            // Verificar estudiante
            $student = $this->neo4j->run(
                "MATCH (e:Estudiante {id_estudiante: \$id}) RETURN e",
                ['id' => $studentId]
            );
            if ($student->count() === 0) {
                return response()->json(['message' => 'Estudiante no encontrado.'], 404);
            }

            $today = date('Y-m-d');
            // Ver si ya existe un registro hoy
            $existente = $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$id})-[:REPORTA]->(s:Estado_Emocional)
                WHERE s.fecha_est = \$today
                RETURN s
            ", ['id' => $studentId, 'today' => $today]);

            if ($existente->count() > 0 && !($validated['replaceExisting'] ?? false)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya registraste tu estado emocional hoy. ¿Quieres actualizarlo?',
                    'record' => $existente->first()->get('s'),
                ], 409);
            }

            // Si existe y se permite reemplazar, eliminar el anterior
            if ($existente->count() > 0) {
                $this->neo4j->run("
                    MATCH (e:Estudiante {id_estudiante: \$id})-[r:REPORTA]->(s:Estado_Emocional)
                    WHERE s.fecha_est = \$today
                    DETACH DELETE s
                ", ['id' => $studentId, 'today' => $today]);
            }

            // Crear nuevo estado emocional
            $maxId = $this->neo4j->run(
                "MATCH (s:Estado_Emocional) RETURN coalesce(max(s.id_estado_emocional), 0) AS maxId"
            )->first()->get('maxId');
            $newId = $maxId + 1;

            $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$studentId})
                CREATE (s:Estado_Emocional {
                    id_estado_emocional: \$id,
                    nivel_emocional: \$emotion,
                    emoji: \$emojiKey,
                    descripcion: \$description,
                    causa: \$cause,
                    nivel_estres: \$stressLevel,
                    fecha_est: \$today,
                    hora_est: \$time,
                    nivel_criticidad: \$criticality
                })
                CREATE (e)-[:REPORTA]->(s)
                RETURN s
            ", [
                'studentId' => $studentId,
                'id' => $newId,
                'emotion' => $validated['emotion'],
                'emojiKey' => $this->emojiKey($validated['emotion']),
                'description' => $validated['description'],
                'cause' => $validated['cause'] ?? '',
                'stressLevel' => (int)($validated['stressLevel'] ?? 1),
                'today' => $today,
                'time' => date('H:i'),
                'criticality' => $this->criticality($validated['emotion']),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registro emocional guardado.',
                'record' => [
                    'id' => $newId,
                    'emotion' => $validated['emotion'],
                    'date' => $today,
                ],
            ], 201);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Error al guardar.'], 500);
        }
    }

    private function mapEmoji(?string $key): string
    {
        return match ($key) {
            'triste' => '😢', 'preocupado' => '😟', 'neutral' => '😐',
            'bien' => '😊', 'muy_bien' => '😄', default => '😶',
        };
    }

    private function emojiKey(string $emotion): string
    {
        return match ($emotion) {
            'Muy bien' => 'muy_bien', 'Bien' => 'bien', 'Regular' => 'neutral',
            'Mal' => 'preocupado', 'Muy mal' => 'triste', default => 'neutral',
        };
    }

    private function criticality(string $emotion): string
    {
        return match ($emotion) {
            'Muy mal' => 'Critico', 'Mal' => 'Alto', 'Regular' => 'Moderado',
            default => 'Leve',
        };
    }
}