<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmotionalAlertMockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmotionalAlertController extends Controller
{
    protected EmotionalAlertMockService $alertService;

    /**
     * Injecting the mock service so it can easily be swapped later via IoC container/contracts
     */
    public function __construct(EmotionalAlertMockService $alertService)
    {
        $this->alertService = $alertService;
    }

    /**
     * GET /api/psychologist/emotional-alerts/students
     * Fetch list of students with active alert statistics
     */
    public function getStudents(): JsonResponse
    {
        try {
            $students = $this->alertService->getStudents();
            return response()->json([
                'success' => true,
                'data'    => $students
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el listado de estudiantes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/psychologist/emotional-alerts/students/{id}/records
     * Fetch emotional logs for a single student
     */
    public function getStudentRecords(int $id): JsonResponse
    {
        try {
            $student = $this->alertService->findStudent($id);
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estudiante no encontrado.'
                ], 404);
            }

            $records = $this->alertService->getRecordsForStudent($id);
            return response()->json([
                'success' => true,
                'student' => $student,
                'data'    => $records
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el historial emocional: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/psychologist/emotional-alerts/{recordId}/review
     * Set alert state to 'Revisada'
     */
    public function reviewRecord(int $recordId): JsonResponse
    {
        try {
            $success = $this->alertService->reviewRecord($recordId);
            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registro de alerta no encontrado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Alerta marcada como revisada exitosamente.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado de la alerta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/psychologist/emotional-alerts/{recordId}/close
     * Set alert state to 'Cerrada'
     */
    public function closeRecord(int $recordId): JsonResponse
    {
        try {
            $success = $this->alertService->closeRecord($recordId);
            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registro de alerta no encontrado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Alerta cerrada exitosamente.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar la alerta: ' . $e->getMessage()
            ], 500);
        }
    }
}
