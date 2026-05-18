<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * EmotionalAlertMockService
 *
 * Provides simulated emotional alert data for the psychologist's alerts module.
 * ─────────────────────────────────────────────────────────────────────────────
 * TO REPLACE WITH REAL DATABASE:
 *   Implement App\Contracts\EmotionalAlertServiceInterface and swap this class
 *   in AppServiceProvider for a Neo4jEmotionalAlertService (or Eloquent-based).
 * ─────────────────────────────────────────────────────────────────────────────
 */
class EmotionalAlertMockService
{
    /**
     * Helper to get overrides from Cache (persisted across HTTP requests)
     */
    private function getOverrides(): array
    {
        return Cache::get('emotional_alerts_overrides', []);
    }

    /**
     * Helper to save overrides to Cache
     */
    private function saveOverrides(array $overrides): void
    {
        Cache::put('emotional_alerts_overrides', $overrides, 3600); // Persist for 1 hour
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STUDENTS
    // ──────────────────────────────────────────────────────────────────────────

    public function getStudents(): array
    {
        $baseStudents = [
            [
                'id'           => 1,
                'name'         => 'Valentina Ríos',
                'program'      => 'Psicología',
                'semester'     => 6,
                'lastEmotion'  => 'Muy mal',
                'lastEmoji'    => '😭',
            ],
            [
                'id'           => 2,
                'name'         => 'Carlos Morales',
                'program'      => 'Ingeniería de Sistemas',
                'semester'     => 4,
                'lastEmotion'  => 'Mal',
                'lastEmoji'    => '😔',
            ],
            [
                'id'           => 3,
                'name'         => 'María Zapata',
                'program'      => 'Administración',
                'semester'     => 8,
                'lastEmotion'  => 'Regular',
                'lastEmoji'    => '😐',
            ],
            [
                'id'           => 4,
                'name'         => 'Andrés Gutiérrez',
                'program'      => 'Medicina',
                'semester'     => 2,
                'lastEmotion'  => 'Bien',
                'lastEmoji'    => '🙂',
            ],
            [
                'id'           => 5,
                'name'         => 'Laura Quintero',
                'program'      => 'Arquitectura',
                'semester'     => 5,
                'lastEmotion'  => 'Muy mal',
                'lastEmoji'    => '😭',
            ],
            [
                'id'           => 6,
                'name'         => 'Sofía Herrera',
                'program'      => 'Derecho',
                'semester'     => 3,
                'lastEmotion'  => 'Muy bien',
                'lastEmoji'    => '😄',
            ],
        ];

        return array_map(function ($student) {
            $records = $this->getRecordsForStudent($student['id']);
            $activeAlerts = 0;
            foreach ($records as $record) {
                if ($record['alertStatus'] === 'Activa') {
                    $activeAlerts++;
                }
            }
            $student['activeAlerts'] = $activeAlerts;

            // Compute riskLevel dynamically based on active alerts count
            if ($activeAlerts > 1) {
                $student['riskLevel'] = 'Alto';
            } elseif ($activeAlerts === 1) {
                $student['riskLevel'] = 'Medio';
            } else {
                $student['riskLevel'] = 'Bajo';
            }

            return $student;
        }, $baseStudents);
    }

    public function findStudent(int $id): ?array
    {
        foreach ($this->getStudents() as $student) {
            if ($student['id'] === $id) {
                return $student;
            }
        }
        return null;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // RECORDS
    // ──────────────────────────────────────────────────────────────────────────

    public function getRecordsForStudent(int $studentId): array
    {
        $base = $this->baseRecords($studentId);
        $overrides = $this->getOverrides();

        // Apply any persisted overrides (status changes)
        return array_map(function (array $record) use ($overrides) {
            $key = $record['id'];
            if (isset($overrides[$key])) {
                $record['alertStatus'] = $overrides[$key];
            }
            return $record;
        }, $base);
    }

    public function findRecord(int $recordId): ?array
    {
        $overrides = $this->getOverrides();
        for ($sid = 1; $sid <= 6; $sid++) {
            foreach ($this->baseRecords($sid) as $record) {
                if ($record['id'] === $recordId) {
                    if (isset($overrides[$recordId])) {
                        $record['alertStatus'] = $overrides[$recordId];
                    }
                    return $record;
                }
            }
        }
        return null;
    }

    public function reviewRecord(int $recordId): bool
    {
        if ($this->findRecord($recordId) === null) {
            return false;
        }
        $overrides = $this->getOverrides();
        $overrides[$recordId] = 'Revisada';
        $this->saveOverrides($overrides);
        return true;
    }

    public function closeRecord(int $recordId): bool
    {
        if ($this->findRecord($recordId) === null) {
            return false;
        }
        $overrides = $this->getOverrides();
        $overrides[$recordId] = 'Cerrada';
        $this->saveOverrides($overrides);
        return true;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // MOCK DATA
    // ──────────────────────────────────────────────────────────────────────────

    private function baseRecords(int $studentId): array
    {
        $allRecords = [
            1 => [
                [
                    'id'          => 101,
                    'studentId'   => 1,
                    'date'        => '2026-05-18',
                    'time'        => '08:30',
                    'emotion'     => 'Muy mal',
                    'emoji'       => '😭',
                    'criticality' => 'Alto',
                    'comment'     => 'Me siento muy abrumada por la carga académica y los exámenes parciales.',
                    'alertStatus' => 'Activa',
                ],
                [
                    'id'          => 102,
                    'studentId'   => 1,
                    'date'        => '2026-05-17',
                    'time'        => '20:15',
                    'emotion'     => 'Muy mal',
                    'emoji'       => '😭',
                    'criticality' => 'Alto',
                    'comment'     => 'No pude dormir bien. Pensamientos negativos recurrentes.',
                    'alertStatus' => 'Activa',
                ],
                [
                    'id'          => 103,
                    'studentId'   => 1,
                    'date'        => '2026-05-16',
                    'time'        => '14:00',
                    'emotion'     => 'Mal',
                    'emoji'       => '😔',
                    'criticality' => 'Medio',
                    'comment'     => 'Discutí con mi familia y no me concentro.',
                    'alertStatus' => 'Revisada',
                ],
                [
                    'id'          => 104,
                    'studentId'   => 1,
                    'date'        => '2026-05-14',
                    'time'        => '09:00',
                    'emotion'     => 'Regular',
                    'emoji'       => '😐',
                    'criticality' => 'Medio',
                    'comment'     => null,
                    'alertStatus' => 'Cerrada',
                ],
            ],
            2 => [
                [
                    'id'          => 201,
                    'studentId'   => 2,
                    'date'        => '2026-05-18',
                    'time'        => '07:45',
                    'emotion'     => 'Mal',
                    'emoji'       => '😔',
                    'criticality' => 'Medio',
                    'comment'     => 'Tengo mucho estrés por los proyectos de programación.',
                    'alertStatus' => 'Activa',
                ],
                [
                    'id'          => 202,
                    'studentId'   => 2,
                    'date'        => '2026-05-15',
                    'time'        => '18:30',
                    'emotion'     => 'Bien',
                    'emoji'       => '🙂',
                    'criticality' => 'Bajo',
                    'comment'     => 'Fue un buen día, entendí el tema de algoritmos.',
                    'alertStatus' => 'Cerrada',
                ],
            ],
            3 => [
                [
                    'id'          => 301,
                    'studentId'   => 3,
                    'date'        => '2026-05-17',
                    'time'        => '12:00',
                    'emotion'     => 'Regular',
                    'emoji'       => '😐',
                    'criticality' => 'Medio',
                    'comment'     => 'Me siento estancada en el trabajo de grado.',
                    'alertStatus' => 'Activa',
                ],
                [
                    'id'          => 302,
                    'studentId'   => 3,
                    'date'        => '2026-05-13',
                    'time'        => '16:20',
                    'emotion'     => 'Bien',
                    'emoji'       => '🙂',
                    'criticality' => 'Bajo',
                    'comment'     => null,
                    'alertStatus' => 'Cerrada',
                ],
            ],
            4 => [
                [
                    'id'          => 401,
                    'studentId'   => 4,
                    'date'        => '2026-05-18',
                    'time'        => '10:00',
                    'emotion'     => 'Bien',
                    'emoji'       => '🙂',
                    'criticality' => 'Bajo',
                    'comment'     => 'Todo va bien por ahora.',
                    'alertStatus' => 'Cerrada',
                ],
                [
                    'id'          => 402,
                    'studentId'   => 4,
                    'date'        => '2026-05-16',
                    'time'        => '09:15',
                    'emotion'     => 'Muy bien',
                    'emoji'       => '😄',
                    'criticality' => 'Bajo',
                    'comment'     => 'Aprobé el parcial de anatomía con buena nota.',
                    'alertStatus' => 'Cerrada',
                ],
            ],
            5 => [
                [
                    'id'          => 501,
                    'studentId'   => 5,
                    'date'        => '2026-05-18',
                    'time'        => '06:00',
                    'emotion'     => 'Muy mal',
                    'emoji'       => '😭',
                    'criticality' => 'Alto',
                    'comment'     => 'Siento que no puedo más. La presión del estudio me está aplastando.',
                    'alertStatus' => 'Activa',
                ],
                [
                    'id'          => 502,
                    'studentId'   => 5,
                    'date'        => '2026-05-17',
                    'time'        => '22:00',
                    'emotion'     => 'Muy mal',
                    'emoji'       => '😭',
                    'criticality' => 'Alto',
                    'comment'     => 'Lloré toda la noche. No sé si seguir estudiando.',
                    'alertStatus' => 'Activa',
                ],
                [
                    'id'          => 503,
                    'studentId'   => 5,
                    'date'        => '2026-05-16',
                    'time'        => '15:30',
                    'emotion'     => 'Muy mal',
                    'emoji'       => '😭',
                    'criticality' => 'Alto',
                    'comment'     => 'Me siento sola y sin apoyo.',
                    'alertStatus' => 'Activa',
                ],
                [
                    'id'          => 504,
                    'studentId'   => 5,
                    'date'        => '2026-05-14',
                    'time'        => '11:00',
                    'emotion'     => 'Mal',
                    'emoji'       => '😔',
                    'criticality' => 'Medio',
                    'comment'     => null,
                    'alertStatus' => 'Revisada',
                ],
            ],
            6 => [
                [
                    'id'          => 601,
                    'studentId'   => 6,
                    'date'        => '2026-05-18',
                    'time'        => '08:00',
                    'emotion'     => 'Muy bien',
                    'emoji'       => '😄',
                    'criticality' => 'Bajo',
                    'comment'     => 'Excelente semana, me siento motivada.',
                    'alertStatus' => 'Cerrada',
                ],
            ],
        ];

        return $allRecords[$studentId] ?? [];
    }
}
