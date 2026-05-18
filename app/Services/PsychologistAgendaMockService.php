<?php

namespace App\Services;

/**
 * PsychologistAgendaMockService
 *
 * Servicio temporal con datos simulados para la agenda del psicólogo.
 *
 * TODO: Reemplazar esta implementación por Neo4jAgendaService cuando
 *       la base de datos Neo4j esté disponible. Implementar la misma
 *       interfaz (all, byDate) para que el controlador no requiera cambios.
 */
class PsychologistAgendaMockService
{
    /**
     * Retorna todas las citas del psicólogo autenticado.
     * En producción: consulta Neo4j filtrando por el nodo (:Psychologist).
     *
     * @return array
     */
    public function all(): array
    {
        return $this->seed();
    }

    /**
     * Retorna las citas de un día específico.
     * En producción: consulta Neo4j con MATCH (:Appointment {date: $date}).
     *
     * @param  string  $date  Formato YYYY-MM-DD
     * @return array
     */
    public function byDate(string $date): array
    {
        return array_values(
            array_filter($this->seed(), fn($c) => $c['date'] === $date)
        );
    }

    /**
     * Reagenda una cita simulada.
     * En producción: MATCH (a:Appointment {id: $id}) SET a.date = $date, a.time = $time ...
     *
     * @param  int    $id
     * @param  array  $data  { date, time, reason }
     * @return array
     */
    public function reschedule(int $id, array $data): array
    {
        $appointment = collect($this->seed())->firstWhere('id', $id);

        if (!$appointment) {
            return ['success' => false, 'message' => 'Cita no encontrada.'];
        }

        if (in_array($appointment['status'], ['atendida'])) {
            return ['success' => false, 'message' => 'No se puede reagendar una cita ya atendida.'];
        }

        // TODO: En Neo4j, actualizar el nodo con los nuevos datos.
        return [
            'success' => true,
            'message' => "Cita de {$appointment['studentName']} reagendada al {$data['date']} a las {$data['time']}.",
            'data'    => array_merge($appointment, [
                'date'   => $data['date'],
                'time'   => $data['time'],
                'status' => 'pendiente',
            ]),
        ];
    }

    /**
     * Cancela una cita simulada.
     * En producción: MATCH (a:Appointment {id: $id}) SET a.status = 'cancelada' ...
     *
     * @param  int    $id
     * @param  string $reason
     * @return array
     */
    public function cancel(int $id, string $reason): array
    {
        $appointment = collect($this->seed())->firstWhere('id', $id);

        if (!$appointment) {
            return ['success' => false, 'message' => 'Cita no encontrada.'];
        }

        if (in_array($appointment['status'], ['atendida', 'cancelada'])) {
            return ['success' => false, 'message' => 'No se puede cancelar esta cita.'];
        }

        // TODO: En Neo4j, actualizar status y guardar el motivo de cancelación.
        return [
            'success' => true,
            'message' => "Cita de {$appointment['studentName']} cancelada correctamente.",
            'data'    => array_merge($appointment, [
                'status'           => 'cancelada',
                'cancellationNote' => $reason,
            ]),
        ];
    }

    /**
     * Datos mock de citas. Refleja el contrato de respuesta que
     * usará el futuro Neo4jAgendaService.
     *
     * Campos:
     *   id          - identificador único
     *   studentName - nombre del estudiante
     *   date        - fecha YYYY-MM-DD
     *   time        - hora de inicio HH:MM
     *   endTime     - hora de fin HH:MM
     *   reason      - motivo de la cita
     *   status      - confirmada | pendiente | urgente | atendida | cancelada
     *   modality    - Presencial | Virtual
     *   room        - sala o plataforma
     */
    private function seed(): array
    {
        $base = date('Y-m');   // mes actual, ej. "2026-05"

        return [
            [
                'id'          => 1,
                'studentName' => 'Valentina Ríos',
                'date'        => "{$base}-05",
                'time'        => '08:00',
                'endTime'     => '09:00',
                'reason'      => 'Ansiedad académica',
                'status'      => 'confirmada',
                'modality'    => 'Presencial',
                'room'        => 'Sala 2',
            ],
            [
                'id'          => 2,
                'studentName' => 'Carlos Morales',
                'date'        => "{$base}-08",
                'time'        => '09:30',
                'endTime'     => '10:30',
                'reason'      => 'Seguimiento depresión',
                'status'      => 'pendiente',
                'modality'    => 'Virtual',
                'room'        => 'Meet',
            ],
            [
                'id'          => 3,
                'studentName' => 'María Zapata',
                'date'        => "{$base}-08",
                'time'        => '11:00',
                'endTime'     => '12:00',
                'reason'      => 'Crisis emocional',
                'status'      => 'urgente',
                'modality'    => 'Presencial',
                'room'        => 'Sala 1',
            ],
            [
                'id'          => 4,
                'studentName' => 'Andrés Gutiérrez',
                'date'        => "{$base}-12",
                'time'        => '10:00',
                'endTime'     => '11:00',
                'reason'      => 'Primera consulta',
                'status'      => 'confirmada',
                'modality'    => 'Presencial',
                'room'        => 'Sala 3',
            ],
            [
                'id'          => 5,
                'studentName' => 'Laura Quintero',
                'date'        => "{$base}-15",
                'time'        => '08:30',
                'endTime'     => '09:30',
                'reason'      => 'Estrés por exámenes',
                'status'      => 'atendida',
                'modality'    => 'Virtual',
                'room'        => 'Meet',
            ],
            [
                'id'          => 6,
                'studentName' => 'Sofía Herrera',
                'date'        => "{$base}-15",
                'time'        => '14:00',
                'endTime'     => '15:00',
                'reason'      => 'Duelo familiar',
                'status'      => 'confirmada',
                'modality'    => 'Presencial',
                'room'        => 'Sala 2',
            ],
            [
                'id'          => 7,
                'studentName' => 'Diego Salcedo',
                'date'        => "{$base}-18",
                'time'        => '09:00',
                'endTime'     => '10:00',
                'reason'      => 'Manejo de emociones',
                'status'      => 'cancelada',
                'modality'    => 'Presencial',
                'room'        => 'Sala 1',
            ],
            [
                'id'          => 8,
                'studentName' => 'Camila Torres',
                'date'        => "{$base}-20",
                'time'        => '11:30',
                'endTime'     => '12:30',
                'reason'      => 'Autoestima y confianza',
                'status'      => 'confirmada',
                'modality'    => 'Virtual',
                'room'        => 'Meet',
            ],
            [
                'id'          => 9,
                'studentName' => 'Felipe Mora',
                'date'        => "{$base}-22",
                'time'        => '08:00',
                'endTime'     => '09:00',
                'reason'      => 'Orientación vocacional',
                'status'      => 'pendiente',
                'modality'    => 'Presencial',
                'room'        => 'Sala 2',
            ],
            [
                'id'          => 10,
                'studentName' => 'Valentina Ríos',
                'date'        => "{$base}-25",
                'time'        => '10:00',
                'endTime'     => '11:00',
                'reason'      => 'Seguimiento ansiedad',
                'status'      => 'confirmada',
                'modality'    => 'Presencial',
                'room'        => 'Sala 2',
            ],
            [
                'id'          => 11,
                'studentName' => 'Carlos Morales',
                'date'        => "{$base}-27",
                'time'        => '15:00',
                'endTime'     => '16:00',
                'reason'      => 'Cierre de proceso',
                'status'      => 'confirmada',
                'modality'    => 'Virtual',
                'room'        => 'Meet',
            ],
            [
                'id'          => 12,
                'studentName' => 'Sofía Herrera',
                'date'        => "{$base}-27",
                'time'        => '16:30',
                'endTime'     => '17:30',
                'reason'      => 'Seguimiento duelo',
                'status'      => 'urgente',
                'modality'    => 'Presencial',
                'room'        => 'Sala 1',
            ],
        ];
    }

    /**
     * Retorna todos los bloqueos del psicólogo autenticado.
     * En producción: consulta Neo4j filtrando por el nodo (:Psychologist).
     *
     * @return array
     */
    public function allBlocks(): array
    {
        return $this->seedBlocks();
    }

    /**
     * Retorna los bloqueos de un día específico.
     * En producción: consulta Neo4j con MATCH (:Block {date: $date}).
     *
     * @param  string  $date  Formato YYYY-MM-DD
     * @return array
     */
    public function blocksByDate(string $date): array
    {
        return array_values(
            array_filter($this->seedBlocks(), fn($b) => $b['date'] === $date)
        );
    }

    /**
     * Crea un nuevo bloqueo simulado.
     * Verifica que no haya cruce con citas existentes en la misma fecha y hora.
     *
     * @param  array $data { date, startTime, endTime, reason, type }
     * @return array
     */
    public function createBlock(array $data): array
    {
        $appointments = $this->byDate($data['date']);

        // Check for overlaps
        foreach ($appointments as $appt) {
            if ($appt['status'] !== 'cancelada') {
                if (
                    ($data['startTime'] >= $appt['time'] && $data['startTime'] < $appt['endTime']) ||
                    ($data['endTime'] > $appt['time'] && $data['endTime'] <= $appt['endTime']) ||
                    ($data['startTime'] <= $appt['time'] && $data['endTime'] >= $appt['endTime'])
                ) {
                    return ['success' => false, 'message' => "Ya tienes una cita ({$appt['time']} - {$appt['endTime']}) que se cruza con este horario."];
                }
            }
        }

        // Return successful simulated creation
        return [
            'success' => true,
            'message' => 'Espacio bloqueado correctamente.',
            'data'    => [
                'id'        => rand(100, 999),
                'date'      => $data['date'],
                'startTime' => $data['startTime'],
                'endTime'   => $data['endTime'],
                'reason'    => $data['reason'],
                'type'      => $data['type'],
            ]
        ];
    }

    /**
     * Datos mock de bloqueos.
     */
    private function seedBlocks(): array
    {
        $base = date('Y-m');

        return [
            [
                'id'        => 1,
                'date'      => "{$base}-10",
                'startTime' => '14:00',
                'endTime'   => '16:00',
                'reason'    => 'Capacitación institucional de protocolo',
                'type'      => 'Capacitación',
            ],
            [
                'id'        => 2,
                'date'      => "{$base}-25",
                'startTime' => '08:00',
                'endTime'   => '09:30',
                'reason'    => 'Reunión de equipo de bienestar',
                'type'      => 'Reunión',
            ]
        ];
    }
}
