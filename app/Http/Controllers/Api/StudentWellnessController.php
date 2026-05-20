<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentWellnessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class StudentWellnessController extends Controller
{
    public function __construct(
        private readonly StudentWellnessService $wellnessService
    ) {
    }

    /**
     * GET /api/student/wellness/{studentId}
     *
     * TODO: Cuando exista autenticacion real, obtener el estudiante desde
     * $request->user() y no desde el parametro publico de prueba.
     */
    public function show(int $studentId): JsonResponse
    {
        try {
            $wellness = $this->wellnessService->getWellness($studentId);

            if (!$wellness) {
                return response()->json([
                    'message' => 'No encontramos informacion para este estudiante.',
                ], 404);
            }

            return response()->json($wellness);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'No pudimos cargar tu bienestar emocional en este momento.',
            ], 500);
        }
    }

    /**
     * POST /api/student/wellness/{studentId}
     *
     * TODO: Reemplazar studentId por el id del estudiante autenticado.
     */
    public function store(Request $request, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'emotion' => ['required', 'string', Rule::in(['Muy bien', 'Bien', 'Regular', 'Mal', 'Muy mal'])],
            'description' => ['required', 'string', 'max:500'],
            'cause' => ['nullable', 'string', 'max:255'],
            'stressLevel' => ['nullable', 'integer', 'between:1,5'],
            'replaceExisting' => ['sometimes', 'boolean'],
        ]);

        try {
            $result = $this->wellnessService->saveRecord(
                $studentId,
                $validated,
                (bool) ($validated['replaceExisting'] ?? false)
            );

            if (($result['status'] ?? null) === 'student_not_found') {
                return response()->json([
                    'message' => 'No encontramos informacion para este estudiante.',
                ], 404);
            }

            if (($result['status'] ?? null) === 'record_exists') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya registraste tu estado emocional hoy. Puedes actualizarlo si confirmas el cambio.',
                    'record' => $result['record'],
                ], 409);
            }

            return response()->json([
                'success' => true,
                'message' => 'Registro emocional guardado correctamente.',
                'record' => $result['record'],
                'alertCreated' => $result['alertCreated'],
            ], $result['updated'] ? 200 : 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'No pudimos guardar tu registro emocional en este momento.',
            ], 500);
        }
    }
}
