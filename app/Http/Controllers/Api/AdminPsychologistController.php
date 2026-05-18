<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminPsychologistMockService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Exception;

class AdminPsychologistController extends Controller
{
    protected $psychologistService;

    /**
     * Inyecta el servicio mock de psicólogos.
     *
     * @param AdminPsychologistMockService $psychologistService
     */
    public function __construct(AdminPsychologistMockService $psychologistService)
    {
        $this->psychologistService = $psychologistService;
    }

    /**
     * GET /api/admin/psychologists
     * Retorna el listado completo de psicólogos.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $list = $this->psychologistService->getAll();
            return response()->json([
                'success' => true,
                'data' => $list
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar los psicólogos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/admin/psychologists
     * Crea y registra un nuevo psicólogo con validaciones estrictas de Fase 4.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'identification' => 'required|numeric',
                'email' => 'required|email|max:255',
                'specialty' => 'required|string|max:255',
                'experience' => 'required|numeric|min:0',
                'phone' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:Activo,Inactivo'
            ], [
                'name.required' => 'El nombre completo del psicólogo es obligatorio.',
                'identification.required' => 'El número de identificación es obligatorio.',
                'identification.numeric' => 'La identificación debe ser un valor numérico.',
                'email.required' => 'El correo electrónico es obligatorio.',
                'email.email' => 'El formato del correo electrónico ingresado no es válido.',
                'specialty.required' => 'La especialidad clínica es obligatoria.',
                'experience.required' => 'Los años de experiencia son obligatorios.',
                'experience.numeric' => 'Los años de experiencia deben ser un valor numérico.',
                'experience.min' => 'Los años de experiencia no pueden ser negativos.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $newPsych = $this->psychologistService->create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Psicólogo registrado exitosamente.',
                'data' => $newPsych
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422); // Retornar 422 cuando la identificación o el correo estén duplicados
        }
    }

    /**
     * PUT /api/admin/psychologists/{id}
     * Actualiza el perfil de un psicólogo.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'identification' => 'nullable|numeric',
                'email' => 'nullable|email|max:255',
                'specialty' => 'nullable|string|max:255',
                'experience' => 'nullable|numeric|min:0',
                'phone' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:Activo,Inactivo'
            ], [
                'identification.numeric' => 'La identificación debe ser un valor numérico.',
                'email.email' => 'El formato del correo electrónico ingresado no es válido.',
                'experience.numeric' => 'Los años de experiencia deben ser un valor numérico.',
                'experience.min' => 'Los años de experiencia no pueden ser negativos.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = $this->psychologistService->update($id, $request->all());

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Psicólogo no encontrado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Perfil del psicólogo actualizado exitosamente.',
                'data' => $updated
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422); // Retornar 422 cuando haya colisión de datos
        }
    }

    /**
     * PATCH /api/admin/psychologists/{id}/toggle-status
     * Alterna el estado operativo (Activo/Inactivo) de un psicólogo.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function toggleStatus(int $id): JsonResponse
    {
        try {
            $updated = $this->psychologistService->toggleStatus($id);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Psicólogo no encontrado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Estado operativo actualizado con éxito.',
                'data' => $updated
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado de psicólogo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/admin/psychologists/{id}
     * Elimina a un psicólogo del sistema.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->psychologistService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Psicólogo no encontrado o ya eliminado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Registro del psicólogo eliminado correctamente.'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar psicólogo: ' . $e->getMessage()
            ], 500);
        }
    }
}
