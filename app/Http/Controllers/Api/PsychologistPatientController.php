<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PsychologistPatientService;
use Illuminate\Http\JsonResponse;
use Throwable;

class PsychologistPatientController extends Controller
{
    public function __construct(
        private readonly PsychologistPatientService $patientService
    ) {
    }

    /**
     * GET /api/psychologist/patients/{psychologistId}
     *
     * TODO: Cuando exista autenticacion real, obtener el psicologo desde
     * $request->user() y no desde el parametro publico de prueba.
     */
    public function index(int $psychologistId): JsonResponse
    {
        try {
            $data = $this->patientService->getPatientsForPsychologist($psychologistId);

            if (!$data) {
                return response()->json([
                    'success' => false,
                    'message' => 'No encontramos informacion para este psicologo.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'summary' => $data['summary'],
                'patients' => $data['patients'],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'No pudimos cargar los pacientes en este momento.',
            ], 500);
        }
    }
}
