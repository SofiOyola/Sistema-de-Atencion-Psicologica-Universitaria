<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class AdminPsychologistMockService
{
    protected const CACHE_KEY = 'admin_psychologists_mock_list';

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
     * Restablece los datos a su estado mock predeterminado con los nuevos campos de Fase 4.
     *
     * @return void
     */
    public function resetToDefaults(): void
    {
        $defaults = [
            [
                'id' => 1,
                'identification' => '1002993882',
                'name' => 'Dra. Laura Méndez',
                'specialty' => 'Psicología Clínica',
                'email' => 'laura.mendez@sapu.edu.co',
                'phone' => '+57 301 445 2211',
                'experience' => 6,
                'status' => 'Activo',
                'assignedPatients' => 8,
                'hoursToday' => '6 hs',
                'rating' => 4.9,
                'initials' => 'LM'
            ],
            [
                'id' => 2,
                'identification' => '1003445522',
                'name' => 'Dr. Andrés Espinoza',
                'specialty' => 'Neuropsicología',
                'email' => 'andres.espinoza@sapu.edu.co',
                'phone' => '+57 312 887 5422',
                'experience' => 4,
                'status' => 'Activo',
                'assignedPatients' => 5,
                'hoursToday' => '4 hs',
                'rating' => 4.8,
                'initials' => 'AE'
            ],
            [
                'id' => 3,
                'identification' => '1005889911',
                'name' => 'Dra. Milena Varela',
                'specialty' => 'Psicología Educativa',
                'email' => 'milena.varela@sapu.edu.co',
                'phone' => '+57 315 221 6688',
                'experience' => 8,
                'status' => 'Activo',
                'assignedPatients' => 7,
                'hoursToday' => '8 hs',
                'rating' => 4.9,
                'initials' => 'MV'
            ],
            [
                'id' => 4,
                'identification' => '1007443311',
                'name' => 'Dr. Juan Sebastián Ruiz',
                'specialty' => 'Psicología Cognitivo-Conductual',
                'email' => 'sebastian.ruiz@sapu.edu.co',
                'phone' => '+57 300 776 5432',
                'experience' => 5,
                'status' => 'Inactivo',
                'assignedPatients' => 0,
                'hoursToday' => '0 hs',
                'rating' => 4.7,
                'initials' => 'JR'
            ]
        ];
        Cache::forever(self::CACHE_KEY, $defaults);
    }

    /**
     * Obtiene el listado completo de psicólogos.
     *
     * @return array
     */
    public function getAll(): array
    {
        return Cache::get(self::CACHE_KEY, []);
    }

    /**
     * Registra un nuevo psicólogo en el almacenamiento temporal de Cache.
     * Valida unicidad de identificación y correo.
     *
     * @param array $data
     * @return array
     * @throws \Exception
     */
    public function create(array $data): array
    {
        $list = $this->getAll();
        
        // Validar duplicados en identificación y correo
        foreach ($list as $p) {
            if ($p['identification'] === $data['identification']) {
                throw new \Exception('La identificación ya se encuentra registrada en el sistema.');
            }
            if (strtolower($p['email']) === strtolower($data['email'])) {
                throw new \Exception('El correo electrónico institucional ya se encuentra registrado.');
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

        $newPsych = [
            'id' => $newId,
            'identification' => $data['identification'],
            'name' => $data['name'],
            'specialty' => $data['specialty'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? '+57 N/A',
            'experience' => (int) $data['experience'],
            'status' => $data['status'] ?? 'Activo',
            'assignedPatients' => 0,
            'hoursToday' => ($data['status'] ?? 'Activo') === 'Activo' ? '4 hs' : '0 hs',
            'rating' => 5.0,
            'initials' => $getInitials($data['name'])
        ];

        $list[] = $newPsych;
        Cache::forever(self::CACHE_KEY, $list);
        return $newPsych;
    }

    /**
     * Actualiza el perfil de un psicólogo existente en Cache.
     * Valida unicidad de identificación y correo para otros profesionales.
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

        // Validar duplicados para otros psicólogos
        foreach ($list as $p) {
            if ($p['id'] !== $id) {
                if (isset($data['identification']) && $p['identification'] === $data['identification']) {
                    throw new \Exception('La identificación ya se encuentra registrada por otro profesional.');
                }
                if (isset($data['email']) && strtolower($p['email']) === strtolower($data['email'])) {
                    throw new \Exception('El correo institucional ya se encuentra registrado por otro profesional.');
                }
            }
        }

        foreach ($list as &$p) {
            if ($p['id'] === $id) {
                $p['identification'] = $data['identification'] ?? $p['identification'];
                $p['name'] = $data['name'] ?? $p['name'];
                $p['specialty'] = $data['specialty'] ?? $p['specialty'];
                $p['email'] = $data['email'] ?? $p['email'];
                $p['phone'] = $data['phone'] ?? $p['phone'];
                $p['experience'] = isset($data['experience']) ? (int)$data['experience'] : $p['experience'];
                $p['status'] = $data['status'] ?? $p['status'];
                
                // Regenerar iniciales si cambia de nombre
                if (isset($data['name'])) {
                    $words = explode(' ', $data['name']);
                    $initials = '';
                    foreach ($words as $w) {
                        if (strlen($w) > 0) {
                            $initials .= strtoupper($w[0]);
                        }
                    }
                    $p['initials'] = substr($initials, 0, 2);
                }

                // Carga horaria automática en base a estado operativo
                if (isset($data['status'])) {
                    $p['hoursToday'] = $data['status'] === 'Activo' ? '4 hs' : '0 hs';
                }

                $updatedItem = $p;
                break;
            }
        }

        if ($updatedItem !== null) {
            Cache::forever(self::CACHE_KEY, $list);
        }

        return $updatedItem;
    }

    /**
     * Alterna en caliente el estado operativo de un psicólogo en Cache.
     *
     * @param int $id
     * @return array|null
     */
    public function toggleStatus(int $id): ?array
    {
        $list = $this->getAll();
        $updatedItem = null;

        foreach ($list as &$p) {
            if ($p['id'] === $id) {
                $p['status'] = $p['status'] === 'Activo' ? 'Inactivo' : 'Activo';
                $p['hoursToday'] = $p['status'] === 'Activo' ? '4 hs' : '0 hs';
                $updatedItem = $p;
                break;
            }
        }

        if ($updatedItem !== null) {
            Cache::forever(self::CACHE_KEY, $list);
        }

        return $updatedItem;
    }

    /**
     * Elimina el registro de un psicólogo en Cache.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $list = $this->getAll();
        $filtered = array_filter($list, fn($p) => $p['id'] !== $id);
        
        if (count($list) !== count($filtered)) {
            Cache::forever(self::CACHE_KEY, array_values($filtered));
            return true;
        }

        return false;
    }
}
