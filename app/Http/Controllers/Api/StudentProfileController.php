<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class StudentProfileController extends Controller
{
    public function __construct(
        private readonly StudentProfileService $profileService
    ) {
    }

    /**
     * GET /api/student/profile/{studentId}
     *
     * TODO: Cuando exista autenticacion real, resolver el estudiante desde
     * $request->user() y no desde el parametro publico de prueba.
     */
    public function show(int $studentId): JsonResponse
    {
        try {
            $student = $this->profileService->getProfile($studentId);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'No encontramos informacion para este estudiante.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'student' => $student,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'No pudimos cargar tu perfil en este momento.',
            ], 500);
        }
    }

    /**
     * PUT /api/student/profile/{studentId}
     *
     * TODO: Reemplazar studentId por el id del estudiante autenticado.
     */
    public function update(Request $request, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'description' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+()\\-\\s]{7,30}$/'],
            'location' => ['nullable', 'string', 'max:120'],
            'interests' => ['nullable', 'string', 'max:300'],
            'emergencyContact' => ['nullable', 'string', 'max:120'],
            'program' => ['nullable', 'string', 'max:120'],
            'semester' => ['nullable', 'integer', 'between:1,12'],
        ]);

        if ($request->has('birthDate')) {
            $validated['birthDate'] = $request->input('birthDate');
        }

        try {
            $student = $this->profileService->updateProfile($studentId, $validated);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'No encontramos informacion para este estudiante.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente.',
                'student' => $student,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'No pudimos actualizar tu perfil en este momento.',
            ], 500);
        }
    }
}
