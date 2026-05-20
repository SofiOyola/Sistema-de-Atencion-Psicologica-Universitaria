<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentTrackingService;
use Illuminate\Http\JsonResponse;
use Throwable;

class StudentTrackingController extends Controller
{
    public function __construct(
        private readonly StudentTrackingService $trackingService
    ) {
    }

    /**
     * GET /api/student/tracking/{studentId}
     *
     * TODO: Cuando la autenticacion real este lista, obtener el estudiante desde
     * $request->user() y no desde el parametro publico de prueba.
     */
    public function show(int $studentId): JsonResponse
    {
        try {
            $tracking = $this->trackingService->getTracking($studentId);

            if (!$tracking) {
                return response()->json([
                    'message' => 'No encontramos informacion para este estudiante.',
                ], 404);
            }

            return response()->json($tracking);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'No pudimos cargar tu seguimiento en este momento.',
            ], 500);
        }
    }
}
