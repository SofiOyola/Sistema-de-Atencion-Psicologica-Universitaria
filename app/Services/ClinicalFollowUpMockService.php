<?php

namespace App\Services;

/**
 * ClinicalFollowUpMockService
 *
 * Servicio temporal con datos simulados para el seguimiento clínico del psicólogo.
 *
 * TODO: Reemplazar esta implementación por Neo4jClinicalService cuando
 *       la base de datos de grafos esté disponible. 
 */
class ClinicalFollowUpMockService
{
    /**
     * Retorna lista simulada de pacientes asignados al psicólogo.
     * En producción: MATCH (p:Psychologist)-[:ASSIGNS]->(s:Student) RETURN s
     */
    public function getAllPatients(): array
    {
        return [
            [
                "id" => 1,
                "name" => "Valentina Ríos",
                "program" => "Psicología",
                "semester" => "6",
                "status" => "En proceso",
                "lastSession" => "2026-05-10"
            ],
            [
                "id" => 2,
                "name" => "Carlos Morales",
                "program" => "Ingeniería de Sistemas",
                "semester" => "4",
                "status" => "Pendiente",
                "lastSession" => "2026-05-08"
            ],
            [
                "id" => 3,
                "name" => "María Zapata",
                "program" => "Administración",
                "semester" => "8",
                "status" => "En proceso",
                "lastSession" => "2026-05-12"
            ],
            [
                "id" => 4,
                "name" => "Laura Quintero",
                "program" => "Arquitectura",
                "semester" => "5",
                "status" => "Finalizado",
                "lastSession" => "2026-04-20"
            ]
        ];
    }

    /**
     * Retorna las notas previas de un paciente específico.
     * En producción: MATCH (s:Student {id: $id})-[:HAS_NOTE]->(n:ClinicalNote) RETURN n ORDER BY n.date DESC
     */
    public function getPatientNotes(int $patientId): array
    {
        $mockNotes = [
            1 => [
                [
                    "id" => 101,
                    "date" => "2026-05-10",
                    "time" => "08:00",
                    "type" => "Sesión",
                    "emotionalState" => "Ansiedad moderada",
                    "description" => "La estudiante manifestó carga académica excesiva y dificultades para dormir.",
                    "observations" => "Se observa nerviosismo. Se recomienda seguimiento continuo.",
                    "recommendations" => "Ejercicios de respiración progresiva.",
                    "nextSteps" => "Nueva sesión en 8 días."
                ]
            ],
            3 => [
                [
                    "id" => 301,
                    "date" => "2026-05-12",
                    "time" => "09:00",
                    "type" => "Seguimiento",
                    "emotionalState" => "Triste",
                    "description" => "Seguimiento de crisis de pánico. Menor frecuencia de episodios.",
                    "observations" => "La paciente reporta ligera mejoría.",
                    "recommendations" => "Técnicas de distracción cognitiva.",
                    "nextSteps" => "Evaluar avance la próxima semana."
                ]
            ],
            4 => [
                [
                    "id" => 401,
                    "date" => "2026-04-20",
                    "time" => "11:00",
                    "type" => "Cierre",
                    "emotionalState" => "Tranquila",
                    "description" => "Cumplimiento de objetivos terapéuticos. Se da alta clínica.",
                    "observations" => "Paciente estable, con herramientas de afrontamiento.",
                    "recommendations" => "Mantener hábitos saludables y rutina de autocuidado.",
                    "nextSteps" => "Ninguno. Cierre de proceso."
                ]
            ]
        ];

        return $mockNotes[$patientId] ?? [];
    }

    /**
     * Simula la creación de una nueva nota clínica.
     * En producción: CREATE (n:ClinicalNote {...}), MATCH (s:Student {id: $patientId}), CREATE (s)-[:HAS_NOTE]->(n)
     */
    public function addNote(int $patientId, array $data): array
    {
        return [
            'success' => true,
            'message' => 'Seguimiento guardado correctamente.',
            'note' => [
                'id' => rand(1000, 9999),
                'date' => $data['date'],
                'time' => $data['time'],
                'type' => $data['type'],
                'emotionalState' => $data['emotionalState'],
                'description' => $data['description'],
                'observations' => $data['observations'],
                'recommendations' => $data['recommendations'] ?? '',
                'nextSteps' => $data['nextSteps'] ?? '',
            ]
        ];
    }
}
