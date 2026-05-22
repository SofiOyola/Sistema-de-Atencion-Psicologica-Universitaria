<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use App\Services\PsychologistResourceNeo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PsychologistResourceController extends Controller
{
    use ResolvesApiUser;

    public function __construct(
        private readonly PsychologistResourceNeo4jService $service,
        private readonly Neo4jService $neo4j
    ) {}

    /**
     * GET /api/psychologist/resources
     */
    public function index(Request $request)
    {
        $psychologistId = $this->psychologistIdFromRequest($request);
        if (!$psychologistId) {
            return $this->unauthenticatedResponse();
        }

        $resources = $this->service->getAllForPsychologist($psychologistId);
        return response()->json(['success' => true, 'data' => $resources]);
    }

    /**
     * POST /api/psychologist/resources
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'type' => 'required|string|in:PDF,Artículo,Video,Podcast,Enlace externo,WEB,YOUTUBE',
            'url' => 'nullable|string',
            'fileName' => 'nullable|string',
            'status' => 'required|string|in:Publicado,Inactivo',
            'creator' => 'nullable|string|max:255',
            'downloads' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $psychologistId = $this->psychologistIdFromRequest($request);
        if (!$psychologistId) {
            return $this->unauthenticatedResponse();
        }

        $resource = $this->service->create($request->all(), $psychologistId);

        return response()->json([
            'success' => true,
            'message' => 'Recurso creado exitosamente.',
            'data' => $resource
        ], 201);
    }

    /**
     * PUT /api/psychologist/resources/{id}
     */
    public function update(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'type' => 'required|string|in:PDF,Artículo,Video,Podcast,Enlace externo,WEB,YOUTUBE',
            'url' => 'nullable|string',
            'fileName' => 'nullable|string',
            'status' => 'required|string|in:Publicado,Inactivo',
            'creator' => 'nullable|string|max:255',
            'downloads' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $psychologistId = $this->psychologistIdFromRequest($request);
        if (!$psychologistId) {
            return $this->unauthenticatedResponse();
        }

        $resource = $this->service->update($id, $request->all(), $psychologistId);

        if (!$resource) {
            return response()->json([
                'success' => false,
                'message' => 'Recurso no encontrado o no tienes permisos.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Recurso actualizado.',
            'data' => $resource
        ]);
    }

    /**
     * PATCH /api/psychologist/resources/{id}/toggle-status
     */
    public function toggleStatus(Request $request, int $id)
    {
        $psychologistId = $this->psychologistIdFromRequest($request);
        if (!$psychologistId) {
            return $this->unauthenticatedResponse();
        }

        $resource = $this->service->toggleStatus($id, $psychologistId);

        if (!$resource) {
            return response()->json([
                'success' => false,
                'message' => 'Recurso no encontrado o no tienes permisos.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Estado cambiado a {$resource['status']}.",
            'data' => $resource
        ]);
    }

    /**
     * DELETE /api/psychologist/resources/{id}
     */
    public function destroy(Request $request, int $id)
    {
        $psychologistId = $this->psychologistIdFromRequest($request);
        if (!$psychologistId) {
            return $this->unauthenticatedResponse();
        }

        $deleted = $this->service->delete($id, $psychologistId);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Recurso no encontrado o no tienes permisos.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Recurso eliminado permanentemente.'
        ]);
    }
}
