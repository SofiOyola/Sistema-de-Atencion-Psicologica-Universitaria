<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class AdminStudentMockService
{
    protected const CACHE_KEY = 'admin_students_mock_list';

    /**
     * Constructor del servicio. Asegura que existan datos iniciales en Cache.
     */
    public function __construct()
    {
        if (!Cache::has(self::CACHE_KEY)) {
            $this->resetToDefaults();
        }
    }

    /**
     * Restablece los datos a su estado mock predeterminado de Fase 2.
     *
     * @return void
     */
    public function resetToDefaults(): void
    {
        $defaults = [
            [
                'id' => 1,
                'identification' => '1002889977',
                'fullName' => 'Carlos Andrés Gómez',
                'birthDate' => '2001-05-14',
                'email' => 'carlos.gomez@sapu.edu.co',
                'phone' => '+57 312 445 6677',
                'career' => 'Ingeniería de Sistemas',
                'semester' => 6,
                'status' => 'En proceso',
                'psychologistName' => 'Dra. Laura Méndez',
                'psychologistEmail' => 'laura.mendez@sapu.edu.co',
                'criticality' => 'Medio',
                'initials' => 'CG'
            ],
            [
                'id' => 2,
                'identification' => '1003665544',
                'fullName' => 'Mariana Sofia Silva',
                'birthDate' => '2003-09-22',
                'email' => 'mariana.silva@sapu.edu.co',
                'phone' => '+57 320 556 1122',
                'career' => 'Psicología',
                'semester' => 4,
                'status' => 'Sin asignar',
                'psychologistName' => 'No asignado',
                'psychologistEmail' => null,
                'criticality' => 'Alto',
                'initials' => 'MS'
            ],
            [
                'id' => 3,
                'identification' => '1005778899',
                'fullName' => 'Mateo Restrepo Rojas',
                'birthDate' => '2000-02-18',
                'email' => 'mateo.restrepo@sapu.edu.co',
                'phone' => '+57 315 229 8877',
                'career' => 'Administración de Empresas',
                'semester' => 8,
                'status' => 'Terminado',
                'psychologistName' => 'Dr. Andrés Espinoza',
                'psychologistEmail' => 'andres.espinoza@sapu.edu.co',
                'criticality' => 'Bajo',
                'initials' => 'MR'
            ],
            [
                'id' => 4,
                'identification' => '1007998811',
                'fullName' => 'Valentina Restrepo Pérez',
                'birthDate' => '2004-11-05',
                'email' => 'valentina.restrepo@sapu.edu.co',
                'phone' => '+57 310 998 7766',
                'career' => 'Medicina',
                'semester' => 2,
                'status' => 'En proceso',
                'psychologistName' => 'Dra. Milena Varela',
                'psychologistEmail' => 'milena.varela@sapu.edu.co',
                'criticality' => 'Alto',
                'initials' => 'VR'
            ]
        ];
        Cache::forever(self::CACHE_KEY, $defaults);
    }

    /**
     * Obtiene la lista completa de estudiantes.
     *
     * @return array
     */
    public function getAll(): array
    {
        return Cache::get(self::CACHE_KEY, []);
    }

    /**
     * Crea un estudiante en Cache de forma simulada.
     *
     * @param array $data
     * @return array
     * @throws \Exception
     */
    public function create(array $data): array
    {
        $list = $this->getAll();

        // Validaciones de duplicados
        foreach ($list as $s) {
            if ($s['identification'] === $data['identification']) {
                throw new \Exception('La identificación ya se encuentra registrada por otro estudiante.');
            }
            if (strtolower($s['email']) === strtolower($data['email'])) {
                throw new \Exception('El correo institucional ya se encuentra registrado por otro estudiante.');
            }
        }

        $getInitials = function($name) {
            $words = explode(' ', $name);
            $initials = '';
            foreach ($words as $word) {
                if (strlen($word) > 0) {
                    $initials .= strtoupper($word[0]);
                }
            }
            return substr($initials, 0, 2);
        };

        $newId = count($list) > 0 ? max(array_column($list, 'id')) + 1 : 1;

        $newStudent = [
            'id' => $newId,
            'identification' => $data['identification'],
            'fullName' => $data['fullName'],
            'birthDate' => $data['birthDate'] ?? '2002-01-01',
            'email' => $data['email'],
            'phone' => $data['phone'] ?? '+57 N/A',
            'career' => $data['career'] ?? 'Ingeniería de Sistemas',
            'semester' => (int) ($data['semester'] ?? 1),
            'status' => $data['status'] ?? 'Sin asignar',
            'psychologistName' => $data['psychologistName'] ?? 'No asignado',
            'psychologistEmail' => $data['psychologistEmail'] ?? null,
            'criticality' => $data['criticality'] ?? 'Bajo',
            'initials' => $getInitials($data['fullName'])
        ];

        $list[] = $newStudent;
        Cache::forever(self::CACHE_KEY, $list);
        return $newStudent;
    }

    /**
     * Modifica el registro de un estudiante en Cache.
     *
     * @param int $id
     * @param array $data
     * @return array|null
     * @throws \Exception
     */
    public function update(int $id, array $data): ?array
    {
        $list = $this->getAll();
        $updatedItem = null;

        // Validaciones de duplicados
        foreach ($list as $s) {
            if ($s['id'] !== $id) {
                if (isset($data['identification']) && $s['identification'] === $data['identification']) {
                    throw new \Exception('La identificación ya se encuentra registrada por otro estudiante.');
                }
                if (isset($data['email']) && strtolower($s['email']) === strtolower($data['email'])) {
                    throw new \Exception('El correo institucional ya se encuentra registrado por otro estudiante.');
                }
            }
        }

        foreach ($list as &$s) {
            if ($s['id'] === $id) {
                $s['identification'] = $data['identification'] ?? $s['identification'];
                $s['fullName'] = $data['fullName'] ?? $s['fullName'];
                $s['birthDate'] = $data['birthDate'] ?? $s['birthDate'];
                $s['email'] = $data['email'] ?? $s['email'];
                $s['phone'] = $data['phone'] ?? $s['phone'];
                $s['career'] = $data['career'] ?? $s['career'];
                $s['semester'] = isset($data['semester']) ? (int)$data['semester'] : $s['semester'];
                $s['status'] = $data['status'] ?? $s['status'];
                $s['psychologistName'] = $data['psychologistName'] ?? $s['psychologistName'];
                $s['psychologistEmail'] = $data['psychologistEmail'] ?? $s['psychologistEmail'];
                $s['criticality'] = $data['criticality'] ?? $s['criticality'];

                if (isset($data['fullName'])) {
                    $words = explode(' ', $data['fullName']);
                    $initials = '';
                    foreach ($words as $w) {
                        if (strlen($w) > 0) {
                            $initials .= strtoupper($w[0]);
                        }
                    }
                    $s['initials'] = substr($initials, 0, 2);
                }

                $updatedItem = $s;
                break;
            }
        }

        if ($updatedItem !== null) {
            Cache::forever(self::CACHE_KEY, $list);
        }

        return $updatedItem;
    }

    /**
     * Elimina el registro de un estudiante del almacenamiento Cache.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $list = $this->getAll();
        $filtered = array_filter($list, fn($s) => $s['id'] !== $id);

        if (count($list) !== count($filtered)) {
            Cache::forever(self::CACHE_KEY, array_values($filtered));
            return true;
        }

        return false;
    }
}
