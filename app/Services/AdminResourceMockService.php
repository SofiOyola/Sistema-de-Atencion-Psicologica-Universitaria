<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class AdminResourceMockService
{
    protected const CACHE_KEY = 'admin_resources_mock_list';

    /**
     * Constructor del servicio. Inicializa los datos mock en Cache.
     */
    public function __construct()
    {
        if (!Cache::has(self::CACHE_KEY)) {
            $this->resetToDefaults();
        }
    }

    /**
     * Restablece la caché con los 4 recursos por defecto de alta fidelidad.
     *
     * @return void
     */
    public function resetToDefaults(): void
    {
        $now = now()->toDateTimeString();
        $defaults = [
            [
                'id' => 1,
                'title' => 'Guía de Respiración Diafragmática contra la Ansiedad',
                'description' => 'Técnicas de respiración profunda explicadas paso a paso para modular episodios severos de crisis emocional o pánico.',
                'category' => 'Ansiedad',
                'type' => 'PDF',
                'url' => '#',
                'fileName' => 'guia_respiracion_diafragmatica.pdf',
                'status' => 'Publicado',
                'creator' => 'Dra. Laura Méndez',
                'downloads' => 142,
                'createdAt' => $now,
                'updatedAt' => $now
            ],
            [
                'id' => 2,
                'title' => 'Técnicas de Gestión del Tiempo Académico en Exámenes',
                'description' => 'Enlace a herramientas interactivas y planificadores visuales recomendados para el control del estrés por sobrecarga.',
                'category' => 'Manejo del tiempo',
                'type' => 'Enlace externo',
                'url' => 'https://sapu.edu.co/resources/time-management',
                'fileName' => null,
                'status' => 'Publicado',
                'creator' => 'Dr. Andrés Espinoza',
                'downloads' => 98,
                'createdAt' => $now,
                'updatedAt' => $now
            ],
            [
                'id' => 3,
                'title' => 'Bitácora Semanal de Autoestima y Afirmaciones',
                'description' => 'Plantilla de autoevaluación guiada diseñada para registrar logros diarios y mejorar la confianza estudiantil.',
                'category' => 'Autoestima',
                'type' => 'PDF',
                'url' => '#',
                'fileName' => 'bitacora_semanal_autoesteem.pdf',
                'status' => 'Publicado',
                'creator' => 'Dra. Milena Varela',
                'downloads' => 75,
                'createdAt' => $now,
                'updatedAt' => $now
            ],
            [
                'id' => 4,
                'title' => 'Manual Práctico de Meditación Guiada Mindfulness',
                'description' => 'Rutina básica de 10 minutos para calmar el sistema nervioso antes de comenzar las jornadas de estudio.',
                'category' => 'Manejo de emociones',
                'type' => 'PDF',
                'url' => '#',
                'fileName' => 'manual_mindfulness.pdf',
                'status' => 'Inactivo',
                'creator' => 'Dra. Laura Méndez',
                'downloads' => 110,
                'createdAt' => $now,
                'updatedAt' => $now
            ]
        ];
        Cache::forever(self::CACHE_KEY, $defaults);
    }

    /**
     * Obtiene todos los recursos.
     *
     * @return array
     */
    public function getAll(): array
    {
        return Cache::get(self::CACHE_KEY, []);
    }

    /**
     * Valida que una categoría sea de la lista obligatoria.
     *
     * @param string $category
     * @return bool
     */
    public function isValidCategory(string $category): bool
    {
        $validCategories = [
            'Ansiedad', 'Estrés', 'Depresión', 'Autoestima', 'Manejo de emociones',
            'Duelo', 'Motivación', 'Hábitos', 'Inteligencia emocional', 'Proyecto de vida',
            'Autoconocimiento', 'Comunicación asertiva', 'Relaciones familiares',
            'Relaciones de pareja', 'Resolución de conflictos', 'Habilidades sociales',
            'Técnicas de estudio', 'Atención y concentración', 'Manejo del tiempo',
            'Orientación vocacional', 'Educación inclusiva'
        ];
        return in_array($category, $validCategories);
    }

    /**
     * Valida que un tipo sea de la lista válida.
     *
     * @param string $type
     * @return bool
     */
    public function isValidType(string $type): bool
    {
        $validTypes = ['PDF', 'Artículo', 'Video', 'Podcast', 'Enlace externo'];
        return in_array($type, $validTypes);
    }

    /**
     * Crea un nuevo recurso.
     *
     * @param array $data
     * @return array
     * @throws \Exception
     */
    public function create(array $data): array
    {
        $list = $this->getAll();

        if (empty($data['title'])) {
            throw new \Exception('El título del recurso es obligatorio.');
        }

        if (!$this->isValidCategory($data['category'] ?? '')) {
            throw new \Exception('La categoría especificada no es válida en el sistema SAPU.');
        }

        if (!$this->isValidType($data['type'] ?? '')) {
            throw new \Exception('El tipo de recurso debe ser PDF, Artículo, Video, Podcast o Enlace externo.');
        }

        // Evitar duplicación de título
        foreach ($list as $r) {
            if (strtolower($r['title']) === strtolower($data['title'])) {
                throw new \Exception('Ya existe un recurso psicoeducativo publicado con este título exacto.');
            }
        }

        $now = now()->toDateTimeString();
        $newId = count($list) > 0 ? max(array_column($list, 'id')) + 1 : 1;

        $newResource = [
            'id' => $newId,
            'title' => trim($data['title']),
            'description' => trim($data['description'] ?? ''),
            'category' => $data['category'],
            'type' => $data['type'],
            'url' => $data['url'] ?? '#',
            'fileName' => $data['fileName'] ?? null,
            'status' => $data['status'] ?? 'Publicado',
            'creator' => $data['creator'] ?? 'Director SAPU',
            'downloads' => (int)($data['downloads'] ?? 0),
            'createdAt' => $now,
            'updatedAt' => $now
        ];

        $list[] = $newResource;
        Cache::forever(self::CACHE_KEY, $list);
        return $newResource;
    }

    /**
     * Actualiza un recurso existente.
     *
     * @param int $id
     * @param array $data
     * @return array|null
     * @throws \Exception
     */
    public function update(int $id, array $data): ?array
    {
        $list = $this->getAll();
        $updatedResource = null;

        if (isset($data['category']) && !$this->isValidCategory($data['category'])) {
            throw new \Exception('La categoría especificada no es válida en el sistema SAPU.');
        }

        if (isset($data['type']) && !$this->isValidType($data['type'])) {
            throw new \Exception('El tipo de recurso debe ser PDF, Artículo, Video, Podcast o Enlace externo.');
        }

        // Validar duplicidad excluyendo el propio recurso
        if (isset($data['title'])) {
            foreach ($list as $r) {
                if ($r['id'] !== $id && strtolower($r['title']) === strtolower($data['title'])) {
                    throw new \Exception('Ya existe otro recurso psicoeducativo con este título exacto.');
                }
            }
        }

        foreach ($list as &$r) {
            if ($r['id'] === $id) {
                $r['title'] = trim($data['title'] ?? $r['title']);
                $r['description'] = trim($data['description'] ?? $r['description']);
                $r['category'] = $data['category'] ?? $r['category'];
                $r['type'] = $data['type'] ?? $r['type'];
                $r['url'] = $data['url'] ?? $r['url'];
                $r['fileName'] = array_key_exists('fileName', $data) ? $data['fileName'] : $r['fileName'];
                $r['status'] = $data['status'] ?? $r['status'];
                $r['creator'] = $data['creator'] ?? $r['creator'];
                $r['downloads'] = isset($data['downloads']) ? (int)$data['downloads'] : $r['downloads'];
                $r['updatedAt'] = now()->toDateTimeString();

                $updatedResource = $r;
                break;
            }
        }

        if ($updatedResource !== null) {
            Cache::forever(self::CACHE_KEY, $list);
        }

        return $updatedResource;
    }

    /**
     * Conmuta el estado de publicación del recurso.
     *
     * @param int $id
     * @return array|null
     */
    public function toggleStatus(int $id): ?array
    {
        $list = $this->getAll();
        $updatedResource = null;

        foreach ($list as &$r) {
            if ($r['id'] === $id) {
                $r['status'] = ($r['status'] === 'Publicado') ? 'Inactivo' : 'Publicado';
                $r['updatedAt'] = now()->toDateTimeString();
                $updatedResource = $r;
                break;
            }
        }

        if ($updatedResource !== null) {
            Cache::forever(self::CACHE_KEY, $list);
        }

        return $updatedResource;
    }

    /**
     * Elimina un recurso del cache.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $list = $this->getAll();
        $filtered = array_filter($list, fn($r) => $r['id'] !== $id);

        if (count($list) !== count($filtered)) {
            Cache::forever(self::CACHE_KEY, array_values($filtered));
            return true;
        }

        return false;
    }
}
