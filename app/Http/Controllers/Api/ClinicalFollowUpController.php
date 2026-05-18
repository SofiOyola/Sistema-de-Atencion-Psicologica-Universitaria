<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClinicalFollowUpMockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicalFollowUpController extends Controller
{
    protected ClinicalFollowUpMockService $service;

    public function __construct(ClinicalFollowUpMockService $service)
    {
        $this->service = $service;
    }

    /**
     * GET /api/psychologist/patients
     * Retorna la lista de pacientes asignados al psicólogo.
     */
    public function getPatients(): JsonResponse
    {
        $patients = $this->service->getAllPatients();
        return response()->json([
            'success' => true,
            'data'    => $patients
        ]);
    }

    /**
     * GET /api/psychologist/patients/{id}/notes
     * Retorna el historial de notas clínicas de un paciente.
     */
    public function getPatientNotes(int $id): JsonResponse
    {
        $notes = $this->service->getPatientNotes($id);
        return response()->json([
            'success' => true,
            'data'    => $notes
        ]);
    }

    /**
     * POST /api/psychologist/patients/{id}/notes
     * Registra una nueva nota clínica para el paciente.
     */
    public function addNote(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'date'           => ['required', 'date_format:Y-m-d'],
            'time'           => ['required', 'date_format:H:i'],
            'type'           => ['required', 'string', 'in:Sesión,Seguimiento,Observación,Cierre'],
            'emotionalState' => ['required', 'string', 'max:255'],
            'description'    => ['required', 'string', 'min:5'],
            'observations'   => ['required', 'string', 'min:5'],
            'recommendations'=> ['nullable', 'string'],
            'nextSteps'      => ['nullable', 'string'],
        ]);

        $result = $this->service->addNote($id, $request->all());

        return response()->json($result, 201);
    }
}
