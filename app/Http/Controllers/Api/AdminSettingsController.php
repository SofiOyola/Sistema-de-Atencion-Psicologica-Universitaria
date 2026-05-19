<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminSettingsMockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class AdminSettingsController extends Controller
{
    protected $settingsService;

    /**
     * Inyección del servicio mock de configuración.
     *
     * @param AdminSettingsMockService $settingsService
     */
    public function __construct(AdminSettingsMockService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Devuelve la información actual del perfil del directivo/administrador.
     * GET /api/admin/settings/profile
     *
     * @return JsonResponse
     */
    public function getProfile(): JsonResponse
    {
        try {
            $profile = $this->settingsService->getProfile();
            return response()->json([
                'success' => true,
                'data' => $profile
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar perfil de configuración: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualiza la información del perfil del directivo/administrador.
     * PUT /api/admin/settings/profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $currentProfile = $this->settingsService->getProfile();

        // 1. Validar que no se intente modificar campos protegidos
        if ($request->has('fullName') && $request->input('fullName') !== $currentProfile['fullName']) {
            return response()->json([
                'success' => false,
                'message' => 'El nombre completo del directivo es inmutable en la configuración.'
            ], 422);
        }

        if ($request->has('email') && $request->input('email') !== $currentProfile['email']) {
            return response()->json([
                'success' => false,
                'message' => 'El correo institucional es inmutable en la configuración.'
            ], 422);
        }

        if ($request->has('role') && $request->input('role') !== $currentProfile['role']) {
            return response()->json([
                'success' => false,
                'message' => 'El rol administrativo es inmutable en la configuración.'
            ], 422);
        }

        // 2. Validaciones normales de campos editables
        $validator = Validator::make($request->all(), [
            'department' => 'required|string|max:100',
            'position' => 'required|string|max:100',
            'description' => 'required|string|max:500',
            'phone' => ['required', 'string', 'regex:/^\+?[0-9\s\-]{7,20}$/'],
            'location' => 'required|string|max:120',
            'avatar' => 'nullable|string'
        ], [
            'department.required' => 'El departamento es obligatorio.',
            'position.required' => 'El cargo o posición es obligatorio.',
            'description.required' => 'La descripción profesional es obligatoria.',
            'description.max' => 'La descripción profesional no debe exceder los 500 caracteres.',
            'phone.required' => 'El teléfono de contacto es obligatorio.',
            'phone.regex' => 'El teléfono de contacto debe tener un formato válido (mínimo 7 dígitos, opcionalmente con prefijo + y espacios).',
            'location.required' => 'La ubicación de oficina es obligatoria.',
            'location.max' => 'La ubicación de oficina no debe exceder los 120 caracteres.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updated = $this->settingsService->updateProfile($request->only([
                'department', 'position', 'description', 'phone', 'location', 'avatar'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Configuración de perfil actualizada con éxito en el servidor.',
                'data' => $updated
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno al guardar la configuración: ' . $e->getMessage()
            ], 500);
        }
    }
}
