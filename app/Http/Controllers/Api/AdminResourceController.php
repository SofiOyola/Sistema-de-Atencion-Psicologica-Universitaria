<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminResourceMockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class AdminResourceController extends Controller
{
    protected $resourceService;

    /**
     * Inyección del servicio mock de recursos.
     *
     * @param AdminResourceMockService $resourceService
     */
    public function __construct(AdminResourceMockService $resourceService)
    {
        $this->resourceService = $resourceService;
    }

    /**
     * Devuelve la lista completa de recursos psicoeducativos.
     * GET /api/admin/resources
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $data = $this->resourceService->getAll();
            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la biblioteca de recursos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registra un nuevo recurso psicoeducativo en el portal simulado.
     * POST /api/admin/resources
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'type' => 'required|string|in:PDF,Artículo,Video,Podcast,Enlace externo',
            'url' => 'nullable|string',
            'fileName' => 'nullable|string',
            'status' => 'required|string|in:Publicado,Inactivo',
            'creator' => 'nullable|string|max:255',
            'downloads' => 'nullable|integer'
        ], [
            'title.required' => 'El título del recurso es obligatorio.',
            'title.max' => 'El título del recurso no debe superar los 255 caracteres.',
            'description.required' => 'La descripción o resumen del recurso es obligatoria.',
            'category.required' => 'La categoría del recurso es obligatoria.',
            'type.required' => 'El tipo de recurso es obligatorio.',
            'type.in' => 'El tipo de recurso seleccionado debe ser PDF, Artículo, Video, Podcast o Enlace externo.',
            'status.required' => 'El estado de publicación es obligatorio.',
            'status.in' => 'El estado de publicación seleccionado no es válido.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $newResource = $this->resourceService->create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Recurso psicoeducativo publicado correctamente.',
                'data' => $newResource
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Actualiza la información de un recurso psicoeducativo existente.
     * PUT /api/admin/resources/{id}
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'type' => 'required|string|in:PDF,Artículo,Video,Podcast,Enlace externo',
            'url' => 'nullable|string',
            'fileName' => 'nullable|string',
            'status' => 'required|string|in:Publicado,Inactivo',
            'creator' => 'nullable|string|max:255',
            'downloads' => 'nullable|integer'
        ], [
            'title.required' => 'El título del recurso es obligatorio.',
            'title.max' => 'El título del recurso no debe superar los 255 caracteres.',
            'description.required' => 'La descripción o resumen del recurso es obligatoria.',
            'category.required' => 'La categoría del recurso es obligatoria.',
            'type.required' => 'El tipo de recurso es obligatorio.',
            'type.in' => 'El tipo de recurso seleccionado debe ser PDF, Artículo, Video, Podcast o Enlace externo.',
            'status.required' => 'El estado de publicación es obligatorio.',
            'status.in' => 'El estado de publicación seleccionado no es válido.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updated = $this->resourceService->update($id, $request->all());
            
            if ($updated === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'El recurso psicoeducativo a modificar no existe en el sistema.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Recurso psicoeducativo modificado correctamente.',
                'data' => $updated
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Conmuta el estado del recurso entre Publicado e Inactivo.
     * PATCH /api/admin/resources/{id}/toggle-status
     *
     * @param int $id
     * @return JsonResponse
     */
    public function toggleStatus(int $id): JsonResponse
    {
        try {
            $updated = $this->resourceService->toggleStatus($id);

            if ($updated === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'El recurso especificado no existe en la biblioteca.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Estado de publicación conmutado con éxito.',
                'data' => $updated
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al conmutar estado de publicación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina permanentemente un recurso psicoeducativo de los registros.
     * DELETE /api/admin/resources/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->resourceService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'El recurso psicoeducativo a eliminar no fue encontrado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Recurso psicoeducativo removido permanentemente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor al intentar eliminar recurso: ' . $e->getMessage()
            ], 500);
        }
    }
}
