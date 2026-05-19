<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class AdminSettingsMockService
{
    protected $cacheKey = 'sapu_admin_profile_mock';

    /**
     * Devuelve los datos actuales del perfil del administrador.
     *
     * @return array
     */
    public function getProfile(): array
    {
        if (!Cache::has($this->cacheKey)) {
            $default = [
                'id' => 'admin-999',
                'fullName' => 'Dr. Roberto Alarcón',
                'email' => 'roberto.alarcon@sapu.edu.co',
                'role' => 'Directivo',
                'department' => 'Bienestar Universitario',
                'position' => 'Director General - SAPU',
                'description' => 'Responsable de la dirección estratégica, la supervisión de la atención clínica y la coordinación del equipo multidisciplinario de salud mental en la universidad.',
                'phone' => '+57 315 765 4321',
                'location' => 'Edificio Central - Oficina 304',
                'avatar' => '/images/doctor_avatar.png',
                'lastAccess' => '2026-05-18 19:15:30',
                'createdAt' => '2025-02-15 08:30:00'
            ];
            Cache::put($this->cacheKey, $default, 1440); // Almacenar por 1 día
        }

        return Cache::get($this->cacheKey);
    }

    /**
     * Actualiza la información del perfil según las reglas de negocio establecidas.
     *
     * @param array $data
     * @return array
     */
    public function updateProfile(array $data): array
    {
        $profile = $this->getProfile();

        // Campos editables aprobados por la fase
        $editableFields = ['department', 'position', 'description', 'phone', 'location', 'avatar'];

        foreach ($editableFields as $field) {
            if (array_key_exists($field, $data)) {
                $profile[$field] = $data[$field];
            }
        }

        Cache::put($this->cacheKey, $profile, 1440);

        return $profile;
    }
}
