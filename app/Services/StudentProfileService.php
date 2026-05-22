<?php

namespace App\Services;

class StudentProfileService
{
    public function __construct(
        private readonly Neo4jService $neo4j
    ) {
    }

    public function getProfile(int $studentId): ?array
    {
        $result = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$studentId})
            OPTIONAL MATCH (e)-[:TIENE]->(u:Usuario)
            RETURN e.id_estudiante AS id,
                   e.nombre AS fullName,
                   coalesce(e.correo_institucional, u.correo_institucional) AS email,
                   e.identificacion AS identification,
                   e.programa_academico AS program,
                   e.semestre AS semester,
                   e.estado_proceso_psicologico AS processStatus,
                   e.descripcion_personal AS description,
                   e.telefono AS phone,
                   e.ubicacion AS location,
                   e.intereses_bienestar AS interests,
                   e.contacto_emergencia AS emergencyContact,
                   e.fecha_nacimiento AS birthDate,
                   e.avatar AS avatar
            LIMIT 1
        ", ['studentId' => $studentId]);

        $record = $this->firstRecord($result);

        return $record ? $this->mapStudent($record) : null;
    }

    public function updateProfile(int $studentId, array $data): ?array
    {
        if (!$this->getProfile($studentId)) {
            return null;
        }

        $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$studentId})
            SET e.descripcion_personal = \$description,
                e.telefono = \$phone,
                e.ubicacion = \$location,
                e.intereses_bienestar = \$interests,
                e.contacto_emergencia = \$emergencyContact,
                e.programa_academico = coalesce(\$program, e.programa_academico),
                e.semestre = coalesce(\$semester, e.semestre),
                e.fecha_nacimiento = coalesce(\$birthDate, e.fecha_nacimiento)
            RETURN e
        ", [
            'studentId' => $studentId,
            'description' => $this->clean($data['description'] ?? null),
            'phone' => $this->clean($data['phone'] ?? null),
            'location' => $this->clean($data['location'] ?? null),
            'interests' => $this->clean($data['interests'] ?? null),
            'emergencyContact' => $this->clean($data['emergencyContact'] ?? null),
            'program' => $this->clean($data['program'] ?? null),
            'semester' => isset($data['semester']) ? (int) $data['semester'] : null,
            'birthDate' => $this->clean($data['birthDate'] ?? null),
        ]);

        return $this->getProfile($studentId);
    }

    private function mapStudent($record): array
    {
        return [
            'id' => $this->value($record, 'id'),
            'fullName' => $this->value($record, 'fullName'),
            'email' => $this->value($record, 'email'),
            'identification' => $this->value($record, 'identification'),
            'program' => $this->value($record, 'program'),
            'semester' => $this->value($record, 'semester'),
            'processStatus' => $this->value($record, 'processStatus'),
            'description' => $this->value($record, 'description'),
            'phone' => $this->value($record, 'phone'),
            'location' => $this->value($record, 'location'),
            'interests' => $this->value($record, 'interests'),
            'emergencyContact' => $this->value($record, 'emergencyContact'),
            'birthDate' => $this->value($record, 'birthDate'),
            'avatar' => $this->value($record, 'avatar'),
        ];
    }

    private function clean(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
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
