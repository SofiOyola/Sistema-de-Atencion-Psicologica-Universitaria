<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;

class EmotionalAlertController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/psychologist/emotional-alerts/students
     */
    public function getStudents(Request $request)
    {
        $psychologistId = $request->user()->psychologist_id;

        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            // Estudiantes con citas o asignaciones vigentes
            OPTIONAL MATCH (p)-[:ATIENDE]->(:Cita)<-[:SOLICITA]-(e:Estudiante)
            OPTIONAL MATCH (p)-[:CORRESPONDE]->(:Asignacion {vigencia: 'Vigente'})<-[:ASIGNA]-(e)
            WITH DISTINCT e
            OPTIONAL MATCH (e)-[:REPORTA]->(s:Estado_Emocional)
            OPTIONAL MATCH (s)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            WITH e, s, a
            ORDER BY s.fecha_est DESC, s.hora_est DESC
            RETURN 
                e.id_estudiante AS id,
                e.nombre AS name,
                e.programa_academico AS program,
                e.semestre AS semester,
                collect(DISTINCT {
                    emocion: s.nivel_emocional,
                    emoji: s.emoji,
                    fecha: s.fecha_est,
                    hora: s.hora_est,
                    criticidad: s.nivel_criticidad,
                    alerta_estado: a.estado_alerta
                })[0] AS ultimoEstado,
                size([a IN collect(DISTINCT a) WHERE a.estado_alerta = 'Activa']) AS activeAlerts
        ", ['id' => $psychologistId]);

        $students = [];
        foreach ($result as $row) {
            $ultimo = $row->get('ultimoEstado');
            $lastEmotion = $ultimo ? ($ultimo['emocion'] ?? '') : '';
            $lastEmoji   = $ultimo ? ($ultimo['emoji'] ?? '') : '';
            $criticality = $ultimo ? ($ultimo['criticidad'] ?? 'Leve') : 'Leve';
            $activeAlerts = (int) $row->get('activeAlerts');

            // Mapear criticidad a nivel de riesgo
            $riskLevel = match (strtolower($criticality)) {
                'critico' => 'Alto',
                'alto'    => 'Alto',
                'moderado'=> 'Medio',
                default   => 'Bajo',
            };

            $students[] = [
                'id'           => $row->get('id'),
                'name'         => $row->get('name'),
                'program'      => $row->get('program'),
                'semester'     => $row->get('semester'),
                'lastEmotion'  => $lastEmotion,
                'lastEmoji'    => $this->mapEmoji($lastEmoji),
                'riskLevel'    => $riskLevel,
                'activeAlerts' => $activeAlerts,
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => $students,
        ]);
    }

    /**
     * GET /api/psychologist/emotional-alerts/students/{id}/records
     */
    public function getStudentRecords(Request $request, $id)
    {
        $psychologistId = $request->user()->psychologist_id;

        $studentResult = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$studentId})
            OPTIONAL MATCH (e)-[:REPORTA]->(s:Estado_Emocional)
            OPTIONAL MATCH (s)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            RETURN e.nombre AS name,
                   e.programa_academico AS program,
                   e.semestre AS semester,
                   collect(DISTINCT {
                       id: s.id_estado_emocional,
                       date: s.fecha_est,
                       time: s.hora_est,
                       emotion: s.nivel_emocional,
                       emoji: s.emoji,
                       comment: COALESCE(s.descripcion, ''),
                       criticality: COALESCE(s.nivel_criticidad, 'Leve'),
                       alertStatus: a.estado_alerta
                   }) AS records
            ORDER BY s.fecha_est DESC, s.hora_est DESC
        ", [
            'studentId' => (int) $id,
        ])->first();

        if (!$studentResult) {
            return response()->json(['success' => false, 'message' => 'Estudiante no encontrado'], 404);
        }

        $records = [];
        foreach ($studentResult->get('records') as $rec) {
            $records[] = [
                'id'          => $rec['id'],
                'date'        => $rec['date'],
                'time'        => $rec['time'],
                'emotion'     => $rec['emotion'],
                'emoji'       => $this->mapEmoji($rec['emoji']),
                'comment'     => $rec['comment'],
                'criticality' => $rec['criticality'],
                'alertStatus' => $rec['alertStatus'] ?? 'Sin alerta',
            ];
        }

        // Calcular nivel de riesgo global (basado en criticidad más alta)
        $maxCriticality = 'Leve';
        foreach ($records as $r) {
            if (in_array(strtolower($r['criticality']), ['critico', 'alto']) && $maxCriticality !== 'Alto') {
                $maxCriticality = 'Alto';
            } elseif (strtolower($r['criticality']) === 'moderado' && $maxCriticality === 'Leve') {
                $maxCriticality = 'Medio';
            }
        }

        return response()->json([
            'success' => true,
            'data'    => $records,
            'student' => [
                'id'        => (int) $id,
                'name'      => $studentResult->get('name'),
                'program'   => $studentResult->get('program'),
                'semester'  => $studentResult->get('semester'),
                'riskLevel' => $maxCriticality,
            ],
        ]);
    }

    /**
     * PUT /api/psychologist/emotional-alerts/{recordId}/review
     */
    public function reviewRecord(Request $request, $recordId)
    {
        $psychologistId = $request->user()->psychologist_id;

        $updated = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:ATIENDE]->(:Cita)-[:GENERA]->(:Nota_Seguimiento)<-[:CONTIENE]-(:Historial_Clinico)<-[:POSEE]-(:Estudiante)-[:REPORTA]->(:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional {id_alerta: \$recordId})
            SET a.estado_alerta = 'Revisada'
            RETURN a
        ", [
            'psychologistId' => $psychologistId,
            'recordId'       => (int) $recordId,
        ]);

        if ($updated->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Alerta no encontrada o no pertenece al psicólogo.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Alerta marcada como Revisada.',
        ]);
    }

    /**
     * PUT /api/psychologist/emotional-alerts/{recordId}/close
     */
    public function closeRecord(Request $request, $recordId)
    {
        $psychologistId = $request->user()->psychologist_id;

        $updated = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:ATIENDE]->(:Cita)-[:GENERA]->(:Nota_Seguimiento)<-[:CONTIENE]-(:Historial_Clinico)<-[:POSEE]-(:Estudiante)-[:REPORTA]->(:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional {id_alerta: \$recordId})
            SET a.estado_alerta = 'Cerrada'
            RETURN a
        ", [
            'psychologistId' => $psychologistId,
            'recordId'       => (int) $recordId,
        ]);

        if ($updated->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Alerta no encontrada o no pertenece al psicólogo.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Alerta cerrada correctamente.',
        ]);
    }

    private function mapEmoji(string $key): string
    {
        return match ($key) {
            'triste'     => '😢',
            'preocupado' => '😟',
            'neutral'    => '😐',
            'bien'       => '😊',
            'muy_bien'   => '😄',
            default      => '😶',
        };
    }
}