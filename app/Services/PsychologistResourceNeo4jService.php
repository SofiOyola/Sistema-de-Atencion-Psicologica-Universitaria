<?php

namespace App\Services;

use App\Contracts\ResourceServiceInterface;

class PsychologistResourceNeo4jService
{
    public function __construct(
        private readonly Neo4jService $neo4j
    ) {}

    /**
     * Obtiene todos los recursos creados por el psicólogo dado.
     */
    public function getAllForPsychologist(int $psychologistId): array
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:CREA]->(r:Recurso_Psicoeducativo)
            RETURN
                r.id_recurso AS id,
                r.titulo AS title,
                r.categoria AS category,
                r.tipo_recurso AS type,
                r.autor AS author,
                r.descripcion AS description,
                r.enlace AS url,
                r.fileName AS fileName,
                r.status AS status,
                r.creator AS creator,
                r.downloads AS downloads,
                r.fecha_publicacion AS createdAt,
                r.updatedAt AS updatedAt
            ORDER BY r.titulo ASC
        ", ['psychologistId' => $psychologistId]);

        return $this->mapResources($result);
    }

    /**
     * Crea un nuevo recurso vinculado al psicólogo.
     */
    public function create(array $data, int $psychologistId): array
    {
        $maxId = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo)
            RETURN coalesce(max(toInteger(r.id_recurso)), 0) AS maxId
        ")->first()->get('maxId');

        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})
            CREATE (r:Recurso_Psicoeducativo {
                id_recurso: \$id,
                titulo: \$title,
                categoria: \$category,
                tipo_recurso: \$type,
                autor: \$author,
                descripcion: \$description,
                enlace: \$url,
                fileName: \$fileName,
                status: \$status,
                creator: \$creator,
                downloads: \$downloads,
                fecha_publicacion: datetime(),
                updatedAt: datetime()
            })
            CREATE (p)-[:CREA]->(r)
            RETURN r
        ", [
            'id' => ((int) $maxId) + 1,
            'psychologistId' => $psychologistId,
            'title' => $data['title'],
            'category' => $data['category'],
            'type' => $data['type'],
            'author' => $data['author'] ?? 'Psicólogo SAPU',
            'description' => $data['description'],
            'url' => $data['url'] ?? '#',
            'fileName' => $data['fileName'] ?? null,
            'status' => $data['status'] ?? 'Publicado',
            'creator' => $data['creator'] ?? 'Psicólogo',
            'downloads' => (int)($data['downloads'] ?? 0)
        ]);

        return $this->mapSingleResource($result);
    }

    /**
     * Actualiza un recurso si pertenece al psicólogo.
     */
    public function update(int $id, array $data, int $psychologistId): ?array
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:CREA]->(r:Recurso_Psicoeducativo {id_recurso: \$id})
            SET r.titulo = \$title,
                r.categoria = \$category,
                r.tipo_recurso = \$type,
                r.descripcion = \$description,
                r.enlace = \$url,
                r.fileName = \$fileName,
                r.status = \$status,
                r.creator = \$creator,
                r.downloads = \$downloads,
                r.updatedAt = datetime()
            RETURN r
        ", [
            'id' => $id,
            'psychologistId' => $psychologistId,
            'title' => $data['title'],
            'category' => $data['category'],
            'type' => $data['type'],
            'description' => $data['description'],
            'url' => $data['url'] ?? '#',
            'fileName' => $data['fileName'] ?? null,
            'status' => $data['status'],
            'creator' => $data['creator'] ?? 'Psicólogo',
            'downloads' => (int)($data['downloads'] ?? 0)
        ]);

        return $this->mapSingleResource($result);
    }

    /**
     * Conmuta el estado del recurso.
     */
    public function toggleStatus(int $id, int $psychologistId): ?array
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:CREA]->(r:Recurso_Psicoeducativo {id_recurso: \$id})
            SET r.status = CASE r.status
                WHEN 'Publicado' THEN 'Inactivo'
                ELSE 'Publicado' END,
                r.updatedAt = datetime()
            RETURN r
        ", ['id' => $id, 'psychologistId' => $psychologistId]);

        return $this->mapSingleResource($result);
    }

    /**
     * Elimina un recurso y su relación si pertenece al psicólogo.
     */
    public function delete(int $id, int $psychologistId): bool
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[crea:CREA]->(r:Recurso_Psicoeducativo {id_recurso: \$id})
            DELETE crea, r
            RETURN count(r) as deletedCount
        ", ['id' => $id, 'psychologistId' => $psychologistId]);

        return ($result->first()->get('deletedCount') ?? 0) > 0;
    }

    // ─── Helpers ────────────────────────────────────────

    private function mapResources($result): array
    {
        $resources = [];
        foreach ($result as $record) {
            $resources[] = $this->recordToArray($record);
        }
        return $resources;
    }

    private function mapSingleResource($result): ?array
    {
        if ($result->count() === 0) return null;
        return $this->recordToArray($result->first());
    }

    private function recordToArray($record): array
    {
        $type = $record->get('type');
        $normalizedType = match ($type) {
            'WEB' => 'Enlace externo',
            'YOUTUBE' => 'Video',
            default => $type,
        };

        return [
            'id' => $record->get('id'),
            'title' => $record->get('title'),
            'category' => $record->get('category'),
            'type' => $normalizedType,
            'author' => $record->get('author'),
            'description' => $record->get('description'),
            'url' => $record->get('url'),
            'fileName' => $record->get('fileName'),
            'status' => $record->get('status'),
            'creator' => $record->get('creator'),
            'downloads' => $record->get('downloads'),
            'createdAt' => $record->get('createdAt'),
            'updatedAt' => $record->get('updatedAt'),
        ];
    }
}
