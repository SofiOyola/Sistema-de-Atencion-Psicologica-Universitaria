<?php

namespace App\Services;

class PsychologistPatientService
{
    public function __construct(
        private readonly Neo4jService $neo4j
    ) {
    }

    public function getPatientsForPsychologist(int $psychologistId): ?array
    {
        $psychologist = $this->getPsychologist($psychologistId);

        if (!$psychologist) {
            return null;
        }

        $patients = $this->getPatients($psychologistId);

        return [
            'summary' => $this->buildSummary($patients),
            'patients' => $patients,
        ];
    }

    private function getPsychologist(int $psychologistId): ?array
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})
            RETURN p.id_psicologo AS id,
                   p.nombre AS name
            LIMIT 1
        ", ['psychologistId' => $psychologistId]);

        $record = $this->firstRecord($result);

        if (!$record) {
            return null;
        }

        return [
            'id' => $this->value($record, 'id'),
            'name' => $this->value($record, 'name'),
        ];
    }

    private function getPatients(int $psychologistId): array
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})
            CALL {
                WITH p
                MATCH (p)-[:ATIENDE]->(:Cita)<-[:SOLICITA]-(e:Estudiante)
                RETURN e
                UNION
                WITH p
                MATCH (p)-[:CORRESPONDE]->(:Asignacion)<-[:ASIGNA]-(e:Estudiante)
                RETURN e
            }
            WITH DISTINCT p, e
            CALL {
                WITH p, e
                OPTIONAL MATCH (p)-[:ATIENDE]->(c:Cita)<-[:SOLICITA]-(e)
                RETURN count(DISTINCT c) AS appointmentsCount,
                       max(c.fecha) AS lastAppointment
            }
            CALL {
                WITH e
                OPTIONAL MATCH (e)-[:POSEE]->(:Historial_Clinico)-[:CONTIENE]->(n:Nota_Seguimiento)
                RETURN count(DISTINCT n) AS notesCount
            }
            CALL {
                WITH e
                OPTIONAL MATCH (e)-[:REPORTA]->(s:Estado_Emocional)
                WITH s
                ORDER BY s.fecha_est DESC, s.hora_est DESC
                RETURN s.nivel_emocional AS lastEmotion,
                       s.emoji AS lastEmoji,
                       s.fecha_est AS lastEmotionDate
                LIMIT 1
            }
            CALL {
                WITH e
                OPTIONAL MATCH (e)-[:REPORTA]->(:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional)
                WHERE a.estado_alerta = 'Activa'
                RETURN count(DISTINCT a) AS activeAlerts
            }
            RETURN e.id_estudiante AS id,
                   e.nombre AS fullName,
                   e.correo_institucional AS email,
                   e.identificacion AS identification,
                   e.programa_academico AS program,
                   e.estado_proceso_psicologico AS processStatus,
                   p.nombre AS assignedPsychologist,
                   lastAppointment,
                   appointmentsCount,
                   notesCount,
                   lastEmotion,
                   lastEmoji,
                   lastEmotionDate,
                   activeAlerts
            ORDER BY activeAlerts DESC, fullName ASC
        ", ['psychologistId' => $psychologistId]);

        $patients = [];

        foreach ($result as $record) {
            $patients[] = $this->mapPatient($record);
        }

        return $patients;
    }

    private function buildSummary(array $patients): array
    {
        return [
            'totalPatients' => count($patients),
            'inProcess' => count(array_filter(
                $patients,
                fn (array $patient) => $this->normalizeText($patient['processStatus']) === 'en proceso'
            )),
            'finished' => count(array_filter(
                $patients,
                fn (array $patient) => $this->normalizeText($patient['processStatus']) === 'finalizado'
            )),
            'withActiveAlerts' => count(array_filter(
                $patients,
                fn (array $patient) => (int) $patient['activeAlerts'] > 0
            )),
        ];
    }

    private function mapPatient($record): array
    {
        $lastEmotion = $this->value($record, 'lastEmotion');

        return [
            'id' => $this->value($record, 'id'),
            'fullName' => $this->value($record, 'fullName'),
            'email' => $this->value($record, 'email'),
            'identification' => $this->value($record, 'identification'),
            'program' => $this->value($record, 'program'),
            'processStatus' => $this->value($record, 'processStatus') ?: 'Sin estado',
            'lastAppointment' => $this->value($record, 'lastAppointment'),
            'appointmentsCount' => (int) ($this->value($record, 'appointmentsCount') ?? 0),
            'notesCount' => (int) ($this->value($record, 'notesCount') ?? 0),
            'lastEmotion' => $lastEmotion ?: 'Sin registro',
            'lastEmoji' => $this->value($record, 'lastEmoji') ?: $this->emojiForEmotion($lastEmotion),
            'lastEmotionDate' => $this->value($record, 'lastEmotionDate'),
            'activeAlerts' => (int) ($this->value($record, 'activeAlerts') ?? 0),
            'assignedPsychologist' => $this->value($record, 'assignedPsychologist'),
        ];
    }

    private function emojiForEmotion(?string $emotion): string
    {
        return match ($this->normalizeText($emotion)) {
            'muy bien' => '😊',
            'bien' => '🙂',
            'regular' => '😐',
            'mal' => '😟',
            'muy mal' => '😭',
            default => '•',
        };
    }

    private function normalizeText(?string $value): string
    {
        $value = trim(mb_strtolower($value ?? ''));

        return str_replace(['á', 'é', 'í', 'ó', 'ú'], ['a', 'e', 'i', 'o', 'u'], $value);
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
