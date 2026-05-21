<?php

namespace App\Services;

use App\Contracts\ResourceServiceInterface;

class ResourceNeo4jService implements ResourceServiceInterface
{
    public function __construct(
        private readonly Neo4jService $neo4j
    ) {
    }

    public function all(): array
    {
        $result = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo)
            RETURN 
                r.id_recurso AS id,
                r.titulo AS title,
                r.categoria AS category,
                r.tipo_recurso AS type,
                r.autor AS author,
                r.descripcion AS description,
                r.enlace AS link
            ORDER BY r.titulo ASC
        ");

        return $this->mapResources($result);
    }

    public function categories(): array
    {
        $result = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo)
            RETURN DISTINCT r.categoria AS category
            ORDER BY category ASC
        ");

        $categories = [];

        foreach ($result as $record) {
            $categories[] = $this->value($record, 'category');
        }

        return $categories;
    }

    public function search(string $query): array
    {
        $result = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo)
            WHERE toLower(r.titulo) CONTAINS toLower(\$query)
               OR toLower(r.categoria) CONTAINS toLower(\$query)
               OR toLower(r.descripcion) CONTAINS toLower(\$query)
            RETURN 
                r.id_recurso AS id,
                r.titulo AS title,
                r.categoria AS category,
                r.tipo_recurso AS type,
                r.autor AS author,
                r.descripcion AS description,
                r.enlace AS link
            ORDER BY r.titulo ASC
        ", [
            'query' => $query
        ]);

        return $this->mapResources($result);
    }

    private function mapResources($result): array
    {
        $resources = [];

        foreach ($result as $record) {
            $rawType = strtoupper($this->value($record, 'type') ?? '');

            $type = match ($rawType) {
                'PDF' => 'pdf',
                'YOUTUBE' => 'video',
                'WEB' => 'external',
                default => 'external',
            };

            $link = $this->value($record, 'link');

            $resources[] = [
                'id' => $this->value($record, 'id'),
                'title' => $this->value($record, 'title'),
                'category' => $this->value($record, 'category'),
                'type' => $type,
                'author' => $this->value($record, 'author'),
                'description' => $this->value($record, 'description'),
                'url' => $link,
                'link' => $link,
                'size' => $this->value($record, 'author') ?: $rawType,
                'image' => $this->imageByCategory($this->value($record, 'category')),
            ];
        }

        return $resources;
    }

    private function imageByCategory(?string $category): string
    {
        $category = mb_strtolower(trim($category ?? ''));

        return match ($category) {
            'ansiedad',
            'autoestima',
            'depresión',
            'depresion',
            'duelo',
            'estrés',
            'estres',
            'manejo de emociones' => '/images/resources/lanaAzul.png',

            'atención y concentración',
            'atencion y concentracion',
            'educación inclusiva',
            'educacion inclusiva',
            'manejo del tiempo',
            'orientación vocacional',
            'orientacion vocacional',
            'técnicas de estudio',
            'tecnicas de estudio' => '/images/resources/lanaMorada.png',

            'autoconocimiento',
            'hábitos',
            'habitos',
            'inteligencia emocional',
            'motivación',
            'motivacion',
            'proyecto de vida' => '/images/resources/lanaAmarilla.png',

            'comunicación asertiva',
            'comunicacion asertiva',
            'habilidades sociales',
            'relaciones de pareja',
            'relaciones familiares',
            'resolución de conflictos',
            'resolucion de conflictos' => '/images/resources/lanaRoja.png',

            default => '/images/resources/lanaAzul.png',
        };
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