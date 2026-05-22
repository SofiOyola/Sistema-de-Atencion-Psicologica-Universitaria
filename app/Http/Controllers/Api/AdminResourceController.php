<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminResourceController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/admin/resources
     */
    public function index()
    {
        $result = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo)
            RETURN 
                r.id_recurso AS id,
                r.titulo AS title,
                r.categoria AS category,
                r.tipo_recurso AS type,
                r.descripcion AS description,
                r.enlace AS url,
                COALESCE(r.fileName, '') AS fileName,
                COALESCE(r.status, 'Publicado') AS status,
                COALESCE(r.creator, 'SAPU') AS creator,
                COALESCE(r.downloads, 0) AS downloads
            ORDER BY r.titulo
        ");

        $resources = [];
        foreach ($result as $row) {
            $resources[] = [
                'id'          => $row->get('id'),
                'title'       => $row->get('title'),
                'category'    => $row->get('category'),
                'type'        => $row->get('type'),
                'description' => $row->get('description'),
                'url'         => $row->get('url'),
                'fileName'    => $row->get('fileName'),
                'status'      => $row->get('status'),
                'creator'     => $row->get('creator'),
                'downloads'   => (int) $row->get('downloads'),
            ];
        }

        return response()->json(['success' => true, 'data' => $resources]);
    }

    /**
     * POST /api/admin/resources
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'required|string',
            'type'        => 'required|string|in:PDF,Artículo,Video,Podcast,Enlace externo',
            'url'         => 'nullable|string',
            'fileName'    => 'nullable|string',
            'status'      => 'required|string|in:Publicado,Inactivo',
            'creator'     => 'nullable|string|max:255',
            'downloads'   => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Generate new ID
        $maxId = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo) RETURN coalesce(max(r.id_recurso), 0) AS maxId
        ")->first()->get('maxId');
        $newId = $maxId + 1;

        $this->neo4j->run("
            CREATE (r:Recurso_Psicoeducativo {
                id_recurso: \$id,
                titulo: \$title,
                descripcion: \$description,
                categoria: \$category,
                tipo_recurso: \$type,
                enlace: \$url,
                fileName: \$fileName,
                status: \$status,
                creator: \$creator,
                downloads: \$downloads,
                fecha_publicacion: date(),
                updatedAt: datetime()
            })
            RETURN r
        ", [
            'id'          => $newId,
            'title'       => $request->input('title'),
            'description' => $request->input('description'),
            'category'    => $request->input('category'),
            'type'        => $request->input('type'),
            'url'         => $request->input('url') ?? '#',
            'fileName'    => $request->input('fileName') ?? null,
            'status'      => $request->input('status'),
            'creator'     => $request->input('creator') ?? 'SAPU',
            'downloads'   => (int) ($request->input('downloads') ?? 0),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Recurso creado.',
            'data'    => [
                'id'          => $newId,
                'title'       => $request->input('title'),
                'description' => $request->input('description'),
                'category'    => $request->input('category'),
                'type'        => $request->input('type'),
                'url'         => $request->input('url') ?? '#',
                'fileName'    => $request->input('fileName') ?? null,
                'status'      => $request->input('status'),
                'creator'     => $request->input('creator') ?? 'SAPU',
                'downloads'   => (int) ($request->input('downloads') ?? 0),
            ]
        ], 201);
    }

    /**
     * PUT /api/admin/resources/{id}
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'required|string',
            'type'        => 'required|string|in:PDF,Artículo,Video,Podcast,Enlace externo',
            'url'         => 'nullable|string',
            'fileName'    => 'nullable|string',
            'status'      => 'required|string|in:Publicado,Inactivo',
            'creator'     => 'nullable|string|max:255',
            'downloads'   => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $updated = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo {id_recurso: \$id})
            SET r.titulo = \$title,
                r.descripcion = \$description,
                r.categoria = \$category,
                r.tipo_recurso = \$type,
                r.enlace = \$url,
                r.fileName = \$fileName,
                r.status = \$status,
                r.creator = \$creator,
                r.downloads = \$downloads,
                r.updatedAt = datetime()
            RETURN r
        ", [
            'id'          => (int) $id,
            'title'       => $request->input('title'),
            'description' => $request->input('description'),
            'category'    => $request->input('category'),
            'type'        => $request->input('type'),
            'url'         => $request->input('url') ?? '#',
            'fileName'    => $request->input('fileName') ?? null,
            'status'      => $request->input('status'),
            'creator'     => $request->input('creator') ?? 'SAPU',
            'downloads'   => (int) ($request->input('downloads') ?? 0),
        ]);

        if ($updated->count() === 0) {
            return response()->json(['success' => false, 'message' => 'Recurso no encontrado.'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Recurso actualizado.',
            'data'    => [
                'id'          => (int) $id,
                'title'       => $request->input('title'),
                'description' => $request->input('description'),
                'category'    => $request->input('category'),
                'type'        => $request->input('type'),
                'url'         => $request->input('url') ?? '#',
                'fileName'    => $request->input('fileName') ?? null,
                'status'      => $request->input('status'),
                'creator'     => $request->input('creator') ?? 'SAPU',
                'downloads'   => (int) ($request->input('downloads') ?? 0),
            ]
        ]);
    }

    /**
     * PATCH /api/admin/resources/{id}/toggle-status
     */
    public function toggleStatus($id)
    {
        $updated = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo {id_recurso: \$id})
            SET r.status = CASE r.status WHEN 'Publicado' THEN 'Inactivo' ELSE 'Publicado' END,
                r.updatedAt = datetime()
            RETURN r
        ", ['id' => (int) $id]);

        if ($updated->count() === 0) {
            return response()->json(['success' => false, 'message' => 'Recurso no encontrado.'], 404);
        }

        $row = $updated->first();
        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado.',
            'data'    => [
                'id'          => (int) $id,
                'title'       => $row->get('title'),
                'description' => $row->get('description'),
                'category'    => $row->get('category'),
                'type'        => $row->get('type'),
                'url'         => $row->get('url'),
                'fileName'    => $row->get('fileName'),
                'status'      => $row->get('status'),
                'creator'     => $row->get('creator'),
                'downloads'   => (int) $row->get('downloads'),
            ]
        ]);
    }

    /**
     * DELETE /api/admin/resources/{id}
     */
    public function destroy($id)
    {
        $deleted = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo {id_recurso: \$id})
            DETACH DELETE r
            RETURN count(r) AS deletedCount
        ", ['id' => (int) $id])->first()->get('deletedCount');

        if ($deleted == 0) {
            return response()->json(['success' => false, 'message' => 'Recurso no encontrado.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Recurso eliminado.']);
    }
}