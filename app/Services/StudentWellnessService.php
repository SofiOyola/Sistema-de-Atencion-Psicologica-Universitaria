<?php

namespace App\Services;

use Carbon\Carbon;

class StudentWellnessService
{
    public function __construct(
        private readonly Neo4jService $neo4j
    ) {
    }

    public function getWellness(int $studentId): ?array
    {
        $student = $this->getStudent($studentId);

        if (!$student) {
            return null;
        }

        $records = $this->getRecords($studentId);

        return [
            'student' => $student,
            'summary' => $this->buildSummary($records),
            'records' => $records,
        ];
    }

    public function saveRecord(int $studentId, array $data, bool $replaceExisting = false): array
    {
        if (!$this->getStudent($studentId)) {
            return ['status' => 'student_not_found'];
        }

        $today = Carbon::now('America/Bogota')->toDateString();
        $time = Carbon::now('America/Bogota')->format('H:i');
        $existing = $this->getRecordForDate($studentId, $today);

        if ($existing && !$replaceExisting) {
            return [
                'status' => 'record_exists',
                'record' => $existing,
            ];
        }

        $emotion = $this->emotionConfig($data['emotion']);
        $description = trim($data['description']);
        $cause = trim((string) ($data['cause'] ?? ''));
        $stressLevel = isset($data['stressLevel']) ? (int) $data['stressLevel'] : null;

        if ($existing) {
            $recordId = (int) $existing['id'];

            $this->neo4j->run("
                MATCH (:Estudiante {id_estudiante: \$studentId})-[:REPORTA]->(s:Estado_Emocional {id_estado_emocional: \$recordId})
                SET s.nivel_emocional = \$emotion,
                    s.emoji = \$emoji,
                    s.descripcion = \$description,
                    s.causa = \$cause,
                    s.nivel_estres = \$stressLevel,
                    s.nivel_criticidad = \$criticality,
                    s.hora_est = \$time
                RETURN s
            ", [
                'studentId' => $studentId,
                'recordId' => $recordId,
                'emotion' => $emotion['label'],
                'emoji' => $emotion['emoji'],
                'description' => $description,
                'cause' => $cause ?: null,
                'stressLevel' => $stressLevel,
                'criticality' => $emotion['criticality'],
                'time' => $time,
            ]);

            $alertCreated = $this->syncCriticalAlert($recordId, $emotion, $description, $today);

            return [
                'status' => 'saved',
                'updated' => true,
                'alertCreated' => $alertCreated,
                'record' => $this->getRecordById($recordId),
            ];
        }

        $result = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$studentId})
            OPTIONAL MATCH (existing:Estado_Emocional)
            WITH e, coalesce(max(existing.id_estado_emocional), 0) + 1 AS newId
            CREATE (s:Estado_Emocional {
                id_estado_emocional: newId,
                nivel_emocional: \$emotion,
                emoji: \$emoji,
                descripcion: \$description,
                causa: \$cause,
                nivel_estres: \$stressLevel,
                nivel_criticidad: \$criticality,
                fecha_est: \$date,
                hora_est: \$time
            })
            CREATE (e)-[:REPORTA]->(s)
            RETURN s.id_estado_emocional AS id
        ", [
            'studentId' => $studentId,
            'emotion' => $emotion['label'],
            'emoji' => $emotion['emoji'],
            'description' => $description,
            'cause' => $cause ?: null,
            'stressLevel' => $stressLevel,
            'criticality' => $emotion['criticality'],
            'date' => $today,
            'time' => $time,
        ]);

        $record = $this->firstRecord($result);
        $recordId = (int) $this->value($record, 'id');
        $alertCreated = $this->syncCriticalAlert($recordId, $emotion, $description, $today);

        return [
            'status' => 'saved',
            'updated' => false,
            'alertCreated' => $alertCreated,
            'record' => $this->getRecordById($recordId),
        ];
    }

    private function getStudent(int $studentId): ?array
    {
        $result = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$studentId})
            RETURN e.id_estudiante AS id,
                   e.nombre AS name
            LIMIT 1
        ", ['studentId' => $studentId]);

        $record = $this->firstRecord($result);

        if (!$record) {
            return null;
        }

        return [
            'id' => $this->value($record, 'id'),
            'name' => $this->value($record, 'name'),
        ];
    }

    private function getRecords(int $studentId): array
    {
        $result = $this->neo4j->run("
            MATCH (:Estudiante {id_estudiante: \$studentId})-[:REPORTA]->(s:Estado_Emocional)
            OPTIONAL MATCH (s)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            RETURN s.id_estado_emocional AS id,
                   s.nivel_emocional AS emotion,
                   s.emoji AS emoji,
                   s.descripcion AS description,
                   s.causa AS cause,
                   s.nivel_estres AS stressLevel,
                   s.nivel_criticidad AS criticality,
                   s.fecha_est AS date,
                   s.hora_est AS time,
                   a.id_alerta AS alertId,
                   a.nivel_alerta AS alertLevel,
                   a.estado_alerta AS alertStatus
            ORDER BY s.fecha_est DESC, s.hora_est DESC
            LIMIT 60
        ", ['studentId' => $studentId]);

        $records = [];

        foreach ($result as $record) {
            $records[] = $this->mapRecord($record);
        }

        return $records;
    }

    private function getRecordForDate(int $studentId, string $date): ?array
    {
        $result = $this->neo4j->run("
            MATCH (:Estudiante {id_estudiante: \$studentId})-[:REPORTA]->(s:Estado_Emocional {fecha_est: \$date})
            OPTIONAL MATCH (s)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            RETURN s.id_estado_emocional AS id,
                   s.nivel_emocional AS emotion,
                   s.emoji AS emoji,
                   s.descripcion AS description,
                   s.causa AS cause,
                   s.nivel_estres AS stressLevel,
                   s.nivel_criticidad AS criticality,
                   s.fecha_est AS date,
                   s.hora_est AS time,
                   a.id_alerta AS alertId,
                   a.nivel_alerta AS alertLevel,
                   a.estado_alerta AS alertStatus
            LIMIT 1
        ", [
            'studentId' => $studentId,
            'date' => $date,
        ]);

        $record = $this->firstRecord($result);

        return $record ? $this->mapRecord($record) : null;
    }

    private function getRecordById(int $recordId): array
    {
        $result = $this->neo4j->run("
            MATCH (s:Estado_Emocional {id_estado_emocional: \$recordId})
            OPTIONAL MATCH (s)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            RETURN s.id_estado_emocional AS id,
                   s.nivel_emocional AS emotion,
                   s.emoji AS emoji,
                   s.descripcion AS description,
                   s.causa AS cause,
                   s.nivel_estres AS stressLevel,
                   s.nivel_criticidad AS criticality,
                   s.fecha_est AS date,
                   s.hora_est AS time,
                   a.id_alerta AS alertId,
                   a.nivel_alerta AS alertLevel,
                   a.estado_alerta AS alertStatus
            LIMIT 1
        ", ['recordId' => $recordId]);

        return $this->mapRecord($this->firstRecord($result));
    }

    private function syncCriticalAlert(int $recordId, array $emotion, string $description, string $date): bool
    {
        $isCritical = $emotion['label'] === 'Muy mal' || $emotion['criticality'] === 'Crítico';

        if (!$isCritical) {
            $this->neo4j->run("
                MATCH (:Estado_Emocional {id_estado_emocional: \$recordId})-[:GENERA_ALERTA]->(a:Alerta_Emocional)
                SET a.estado_alerta = 'Cerrada'
            ", ['recordId' => $recordId]);

            return false;
        }

        $existing = $this->neo4j->run("
            MATCH (:Estado_Emocional {id_estado_emocional: \$recordId})-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            RETURN a.id_alerta AS id
            LIMIT 1
        ", ['recordId' => $recordId]);

        if ($this->firstRecord($existing)) {
            $this->neo4j->run("
                MATCH (:Estado_Emocional {id_estado_emocional: \$recordId})-[:GENERA_ALERTA]->(a:Alerta_Emocional)
                SET a.fecha_generacion = \$date,
                    a.nivel_alerta = 'Alta',
                    a.descripcion_alerta = \$description,
                    a.estado_alerta = 'Activa'
            ", [
                'recordId' => $recordId,
                'date' => $date,
                'description' => $this->alertDescription($description),
            ]);

            return false;
        }

        $this->neo4j->run("
            MATCH (s:Estado_Emocional {id_estado_emocional: \$recordId})
            OPTIONAL MATCH (existing:Alerta_Emocional)
            WITH s, coalesce(max(existing.id_alerta), 0) + 1 AS newId
            CREATE (a:Alerta_Emocional {
                id_alerta: newId,
                fecha_generacion: \$date,
                nivel_alerta: 'Alta',
                descripcion_alerta: \$description,
                estado_alerta: 'Activa'
            })
            CREATE (s)-[:GENERA_ALERTA]->(a)
        ", [
            'recordId' => $recordId,
            'date' => $date,
            'description' => $this->alertDescription($description),
        ]);

        return true;
    }

    private function buildSummary(array $records): array
    {
        $currentMonth = Carbon::now('America/Bogota')->format('Y-m');
        $recordsThisMonth = count(array_filter(
            $records,
            fn (array $record) => str_starts_with((string) $record['date'], $currentMonth)
        ));

        $frequencies = [];
        $activeAlerts = 0;

        foreach ($records as $record) {
            $emotion = $record['emotion'] ?: 'Sin registro';
            $frequencies[$emotion] = ($frequencies[$emotion] ?? 0) + 1;

            if (($record['alert']['status'] ?? null) === 'Activa') {
                $activeAlerts++;
            }
        }

        arsort($frequencies);

        return [
            'recordsThisMonth' => $recordsThisMonth,
            'mostFrequentEmotion' => array_key_first($frequencies),
            'lastRecordDate' => $records[0]['date'] ?? null,
            'activeAlerts' => $activeAlerts,
        ];
    }

    private function emotionConfig(string $emotion): array
    {
        return match ($emotion) {
            'Muy bien' => ['label' => 'Muy bien', 'emoji' => '😊', 'criticality' => 'Leve'],
            'Bien' => ['label' => 'Bien', 'emoji' => '🙂', 'criticality' => 'Leve'],
            'Regular' => ['label' => 'Regular', 'emoji' => '😐', 'criticality' => 'Moderado'],
            'Mal' => ['label' => 'Mal', 'emoji' => '😟', 'criticality' => 'Alto'],
            'Muy mal' => ['label' => 'Muy mal', 'emoji' => '😭', 'criticality' => 'Crítico'],
        };
    }

    private function mapRecord($record): array
    {
        $emotion = (string) $this->value($record, 'emotion');
        $config = in_array($emotion, ['Muy bien', 'Bien', 'Regular', 'Mal', 'Muy mal'], true)
            ? $this->emotionConfig($emotion)
            : null;

        return [
            'id' => $this->value($record, 'id'),
            'emotion' => $emotion,
            'emoji' => $this->value($record, 'emoji') ?: ($config['emoji'] ?? '🙂'),
            'description' => $this->value($record, 'description'),
            'cause' => $this->value($record, 'cause'),
            'stressLevel' => $this->value($record, 'stressLevel'),
            'criticality' => $this->value($record, 'criticality') ?: ($config['criticality'] ?? 'Leve'),
            'date' => $this->value($record, 'date'),
            'time' => $this->value($record, 'time'),
            'alert' => $this->value($record, 'alertId') ? [
                'id' => $this->value($record, 'alertId'),
                'level' => $this->value($record, 'alertLevel'),
                'status' => $this->value($record, 'alertStatus'),
            ] : null,
        ];
    }

    private function alertDescription(string $description): string
    {
        return 'Registro emocional crítico del estudiante: ' . mb_substr($description, 0, 220);
    }

    private function firstRecord($result)
    {
        foreach ($result as $record) {
            return $record;
        }

        return null;
    }

    private function value($record, string $key)
    {
        if (!$record) {
            return null;
        }

        try {
            return $record->get($key);
        } catch (\Throwable) {
            return null;
        }
    }
}
