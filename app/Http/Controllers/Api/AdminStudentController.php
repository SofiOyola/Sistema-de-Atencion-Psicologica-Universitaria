<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminStudentMockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class AdminStudentController extends Controller
{
    protected $studentService;

    /**
     * Inyección del servicio mock de estudiantes.
     *
     * @param AdminStudentMockService $studentService
     */
    public function __construct(AdminStudentMockService $studentService)
    {
        $this->studentService = $studentService;
    }

    /**
     * Devuelve la lista completa de estudiantes registrados.
     * GET /api/admin/students
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $data = $this->studentService->getAll();
            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la lista de estudiantes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registra un nuevo estudiante en el sistema simulado.
     * POST /api/admin/students
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'identification' => 'required|numeric',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string',
            'career' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:10',
            'status' => 'required|string|in:En proceso,Terminado,Sin asignar',
            'psychologistName' => 'nullable|string|max:255',
            'psychologistEmail' => 'nullable|email|max:255',
            'criticality' => 'required|string|in:Bajo,Medio,Alto',
            'birthDate' => 'nullable|date'
        ], [
            'fullName.required' => 'El nombre completo del estudiante es obligatorio.',
            'identification.required' => 'La cédula o documento es obligatorio.',
            'identification.numeric' => 'La identificación debe ser enteramente numérica.',
            'email.required' => 'El correo electrónico institucional es obligatorio.',
            'email.email' => 'El formato del correo institucional ingresado no es válido.',
            'career.required' => 'La carrera universitaria es obligatoria.',
            'semester.required' => 'El semestre académico es obligatorio.',
            'semester.integer' => 'El semestre debe ser un valor entero.',
            'semester.min' => 'El semestre mínimo admitido es el 1° semestre.',
            'semester.max' => 'El semestre máximo admitido es el 10° semestre.',
            'status.required' => 'El estado de atención del caso es obligatorio.',
            'status.in' => 'El estado de atención especificado no es válido.',
            'criticality.required' => 'El nivel de riesgo/criticidad es obligatorio.',
            'criticality.in' => 'El nivel de riesgo especificado no es válido.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $newStudent = $this->studentService->create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Estudiante registrado correctamente.',
                'data' => $newStudent
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Actualiza la información de un estudiante existente de forma simulada.
     * PUT /api/admin/students/{id}
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'identification' => 'required|numeric',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string',
            'career' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:10',
            'status' => 'required|string|in:En proceso,Terminado,Sin asignar',
            'psychologistName' => 'nullable|string|max:255',
            'psychologistEmail' => 'nullable|email|max:255',
            'criticality' => 'required|string|in:Bajo,Medio,Alto',
            'birthDate' => 'nullable|date'
        ], [
            'fullName.required' => 'El nombre completo del estudiante es obligatorio.',
            'identification.required' => 'La cédula o documento es obligatorio.',
            'identification.numeric' => 'La identificación debe ser enteramente numérica.',
            'email.required' => 'El correo electrónico institucional es obligatorio.',
            'email.email' => 'El formato del correo institucional ingresado no es válido.',
            'career.required' => 'La carrera universitaria es obligatoria.',
            'semester.required' => 'El semestre académico es obligatorio.',
            'semester.integer' => 'El semestre debe ser un valor entero.',
            'semester.min' => 'El semestre mínimo admitido es el 1° semestre.',
            'semester.max' => 'El semestre máximo admitido es el 10° semestre.',
            'status.required' => 'El estado de atención del caso es obligatorio.',
            'status.in' => 'El estado de atención especificado no es válido.',
            'criticality.required' => 'El nivel de riesgo/criticidad es obligatorio.',
            'criticality.in' => 'El nivel de riesgo especificado no es válido.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updated = $this->studentService->update($id, $request->all());
            
            if ($updated === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'El estudiante a modificar no existe en el sistema.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Información de estudiante modificada correctamente.',
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
     * Elimina permanentemente a un estudiante de forma simulada.
     * DELETE /api/admin/students/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->studentService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'El estudiante a eliminar no fue encontrado en los registros.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Estudiante eliminado con éxito de los registros.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor al intentar eliminar estudiante: ' . $e->getMessage()
            ], 500);
        }
    }
}
