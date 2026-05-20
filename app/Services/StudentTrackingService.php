<?php

namespace App\Services;

class StudentTrackingService
{
    public function __construct(
        private readonly Neo4jService $neo4j
    ) {
    }

    public function getTracking(int $studentId): ?array
    {
        $student = $this->getStudent($studentId);

        if (!$student) {
            return null;
        }

        $emotions = $this->getEmotions($studentId);
        $appointments = $this->getAppointments($studentId);
        $notes = $this->getNotes($studentId);
        $alerts = $this->getAlerts($studentId);

        return [
            'student' => $student,
            'summary' => $this->buildSummary($student, $emotions, $appointments, $notes, $alerts),
            'emotions' => $emotions,
            'appointments' => $appointments,
            'notes' => $notes,
            'alerts' => $alerts,
        ];
    }

    private function getStudent(int $studentId): ?array
    {
        $result = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$studentId})
            RETURN e.id_estudiante AS id,
                   e.nombre AS name,
                   e.correo_institucional AS email,
                   e.programa_academico AS program,
                   e.semestre AS semester,
                   e.estado_proceso_psicologico AS processStatus
            LIMIT 1
        ", ['studentId' => $studentId]);

        $record = null;

        foreach ($result as $row) {
            $record = $row;
            break;
        }

        if (!$record) {
            return null;
        }

        return [
            'id' => $this->value($record, 'id'),
            'name' => $this->value($record, 'name'),
            'email' => $this->value($record, 'email'),
            'program' => $this->value($record, 'program'),
            'semester' => $this->value($record, 'semester'),
            'processStatus' => $this->value($record, 'processStatus') ?: 'Sin estado registrado',
        ];
    }

    private function getEmotions(int $studentId): array
    {
        $result = $this->neo4j->run("
            MATCH (:Estudiante {id_estudiante: \$studentId})-[:REPORTA]->(s:Estado_Emocional)
            OPTIONAL MATCH (s)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            RETURN s.id_estado_emocional AS id,
                   s.nivel_emocional AS emotion,
                   s.fecha_est AS date,
                   s.hora_est AS time,
                   s.nivel_criticidad AS criticality,
                   a.id_alerta AS alertId,
                   a.nivel_alerta AS alertLevel,
                   a.estado_alerta AS alertStatus,
                   a.descripcion_alerta AS alertDescription
            ORDER BY s.fecha_est DESC, s.hora_est DESC
        ", ['studentId' => $studentId]);

        $data = [];

        foreach ($result as $record) {
            $emotion = $this->normalizeEmotion($this->value($record, 'emotion'));

            $data[] = [
                'id' => $this->value($record, 'id'),
                'emotion' => $emotion['label'],
                'rawEmotion' => $this->value($record, 'emotion'),
                'value' => $emotion['value'],
                'emoji' => $emotion['emoji'],
                'date' => $this->value($record, 'date'),
                'time' => $this->value($record, 'time'),
                'criticality' => $this->value($record, 'criticality') ?: $emotion['criticality'],
                'alert' => $this->value($record, 'alertId') ? [
                    'id' => $this->value($record, 'alertId'),
                    'level' => $this->value($record, 'alertLevel'),
                    'status' => $this->value($record, 'alertStatus'),
                    'description' => $this->value($record, 'alertDescription'),
                ] : null,
            ];
        }

        return $data;
    }

    private function getAppointments(int $studentId): array
    {
        $result = $this->neo4j->run("
            MATCH (:Estudiante {id_estudiante: \$studentId})-[:SOLICITA]->(c:Cita)
            OPTIONAL MATCH (p:Psicologo)-[:ATIENDE]->(c)
            RETURN DISTINCT c.id_cita AS id,
                   c.fecha AS date,
                   c.hora AS time,
                   c.estado_cita AS status,
                   c.motivo_consulta AS reason,
                   p.id_psicologo AS psychologistId,
                   p.nombre AS psychologist
            ORDER BY c.fecha DESC, c.hora DESC
        ", ['studentId' => $studentId]);

        $data = [];

        foreach ($result as $record) {
            $data[] = [
                'id' => $this->value($record, 'id'),
                'date' => $this->value($record, 'date'),
                'time' => $this->value($record, 'time'),
                'status' => $this->normalizeAppointmentStatus($this->value($record, 'status')),
                'reason' => $this->value($record, 'reason'),
                'psychologistId' => $this->value($record, 'psychologistId'),
                'psychologist' => $this->value($record, 'psychologist') ?: 'Profesional por asignar',
            ];
        }

        return $data;
    }

    private function getNotes(int $studentId): array
    {
        $result = $this->neo4j->run("
            MATCH (:Estudiante {id_estudiante: \$studentId})-[:POSEE]->(:Historial_Clinico)-[:CONTIENE]->(n:Nota_Seguimiento)
            OPTIONAL MATCH (p:Psicologo)-[:REGISTRA]->(n)
            RETURN DISTINCT n.id_nota AS id,
                   n.tipo_nota AS type,
                   n.contenido_nota AS content,
                   n.fecha_creacion AS date,
                   n.hora_creacion AS time,
                   p.id_psicologo AS psychologistId,
                   p.nombre AS psychologist
            ORDER BY n.fecha_creacion DESC
        ", ['studentId' => $studentId]);

        $data = [];

        foreach ($result as $record) {
            $data[] = [
                'id' => $this->value($record, 'id'),
                'type' => $this->value($record, 'type') ?: 'Seguimiento',
                'content' => $this->value($record, 'content'),
                'date' => $this->value($record, 'date'),
                'time' => $this->value($record, 'time'),
                'psychologistId' => $this->value($record, 'psychologistId'),
                'psychologist' => $this->value($record, 'psychologist') ?: 'No registrado',
            ];
        }

        return $data;
    }

    private function getAlerts(int $studentId): array
    {
        $result = $this->neo4j->run("
            MATCH (:Estudiante {id_estudiante: \$studentId})-[:REPORTA]->(:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
            RETURN DISTINCT a.id_alerta AS id,
                   a.nivel_alerta AS level,
                   a.descripcion_alerta AS description,
                   a.fecha_generacion AS date,
                   a.estado_alerta AS status
            ORDER BY a.fecha_generacion DESC
        ", ['studentId' => $studentId]);

        $data = [];

        foreach ($result as $record) {
            $data[] = [
                'id' => $this->value($record, 'id'),
                'level' => $this->value($record, 'level'),
                'description' => $this->value($record, 'description'),
                'date' => $this->value($record, 'date'),
                'status' => $this->normalizeAlertStatus($this->value($record, 'status')),
            ];
        }

        return $data;
    }

    private function buildSummary(array $student, array $emotions, array $appointments, array $notes, array $alerts): array
    {
        $completedAppointments = count(array_filter(
            $appointments,
            fn (array $appointment) => $appointment['status'] === 'Completada'
        ));

        $scheduledAppointments = count(array_filter(
            $appointments,
            fn (array $appointment) => in_array($appointment['status'], ['Programada', 'En proceso'], true)
        ));

        $activeAlerts = count(array_filter(
            $alerts,
            fn (array $alert) => $alert['status'] === 'Activa'
        ));

        return [
            'processStatus' => $student['processStatus'],
            'totalEmotions' => count($emotions),
            'completedAppointments' => $completedAppointments,
            'scheduledAppointments' => $scheduledAppointments,
            'activeAlerts' => $activeAlerts,
            'lastFollowUp' => $notes[0]['date'] ?? null,
        ];
    }

    private function normalizeEmotion(?string $emotion): array
    {
        $key = $this->normalizeText($emotion);

        return match ($key) {
            'muy bien', 'excelente', 'alto', 'alta' => [
                'label' => 'Muy bien',
                'value' => 5,
                'emoji' => '😄',
                'criticality' => 'Leve',
            ],
            'bien', 'positivo', 'estable' => [
                'label' => 'Bien',
                'value' => 4,
                'emoji' => '🙂',
                'criticality' => 'Leve',
            ],
            'regular', 'medio', 'media', 'moderado' => [
                'label' => 'Regular',
                'value' => 3,
                'emoji' => '😐',
                'criticality' => 'Moderado',
            ],
            'mal', 'bajo', 'baja' => [
                'label' => 'Mal',
                'value' => 2,
                'emoji' => '😟',
                'criticality' => 'Moderado',
            ],
            'muy mal', 'critico', 'crítico', 'crisis' => [
                'label' => 'Muy mal',
                'value' => 1,
                'emoji' => '😔',
                'criticality' => 'Critico',
            ],
            default => [
                'label' => $emotion ?: 'Sin registro',
                'value' => 3,
                'emoji' => '😐',
                'criticality' => 'Moderado',
            ],
        };
    }

    private function normalizeAppointmentStatus(?string $status): string
    {
        return match ($this->normalizeText($status)) {
            'programada', 'pendiente', 'agendada' => 'Programada',
            'completada', 'finalizada', 'realizada' => 'Completada',
            'cancelada', 'cancelado' => 'Cancelada',
            'en proceso', 'en curso' => 'En proceso',
            default => $status ?: 'Sin estado',
        };
    }

    private function normalizeAlertStatus(?string $status): string
    {
        return match ($this->normalizeText($status)) {
            'activa', 'activo', 'abierta', 'pendiente' => 'Activa',
            'cerrada', 'cerrado', 'revisada', 'atendida' => 'Cerrada',
            default => $status ?: 'Sin estado',
        };
    }

    private function normalizeText(?string $value): string
    {
        $value = trim(mb_strtolower($value ?? ''));
        $value = str_replace(['á', 'é', 'í', 'ó', 'ú'], ['a', 'e', 'i', 'o', 'u'], $value);

        return $value;
    }

    private function value($record, string $key)
    {
        try {
            return $record->get($key);
        } catch (\Throwable) {
            return null;
        }
    }
}
