<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class StudentProfileController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    public function show(int $studentId): JsonResponse
    {
        try {
            $result = $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$id})
                RETURN e.nombre AS fullName,
                       e.correo_institucional AS email,
                       e.identificacion AS identification,
                       e.programa_academico AS program,
                       e.semestre AS semester,
                       e.descripcion_personal AS description,
                       e.telefono AS phone,
                       e.ubicacion AS location,
                       e.intereses_bienestar AS interests,
                       e.contacto_emergencia AS emergencyContact,
                       e.estado_proceso_psicologico AS processStatus,
                       e.fecha_nacimiento AS birthDate
            ", ['id' => $studentId]);

            if ($result->count() === 0) {
                return response()->json(['success' => false, 'message' => 'Estudiante no encontrado.'], 404);
            }

            $record = $result->first();
            $student = [
                'fullName'        => $record->get('fullName'),
                'email'           => $record->get('email'),
                'identification'  => $record->get('identification'),
                'program'         => $record->get('program'),
                'semester'        => $record->get('semester'),
                'description'     => $record->get('description'),
                'phone'           => $record->get('phone'),
                'location'        => $record->get('location'),
                'interests'       => $record->get('interests'),
                'emergencyContact'=> $record->get('emergencyContact'),
                'processStatus'   => $record->get('processStatus'),
                'birthDate'       => $record->get('birthDate'),
            ];

            return response()->json(['success' => true, 'student' => $student]);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Error al cargar perfil.'], 500);
        }
    }

    public function update(Request $request, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:30',
            'location' => 'nullable|string|max:120',
            'interests' => 'nullable|string|max:300',
            'emergencyContact' => 'nullable|string|max:120',
            'program' => 'nullable|string|max:120',
            'semester' => 'nullable|integer|between:1,12',
        ]);

        if ($request->has('birthDate')) {
            $validated['birthDate'] = $request->input('birthDate');
        }

        try {
            $updated = $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$id})
                SET e.descripcion_personal = COALESCE(\$description, e.descripcion_personal),
                    e.telefono = COALESCE(\$phone, e.telefono),
                    e.ubicacion = COALESCE(\$location, e.ubicacion),
                    e.intereses_bienestar = COALESCE(\$interests, e.intereses_bienestar),
                    e.contacto_emergencia = COALESCE(\$emergencyContact, e.contacto_emergencia),
                    e.programa_academico = COALESCE(\$program, e.programa_academico),
                    e.semestre = COALESCE(\$semester, e.semestre)
                RETURN e
            ", [
                'id' => $studentId,
                'description' => $validated['description'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'location' => $validated['location'] ?? null,
                'interests' => $validated['interests'] ?? null,
                'emergencyContact' => $validated['emergencyContact'] ?? null,
                'program' => $validated['program'] ?? null,
                'semester' => $validated['semester'] ?? null,
            ]);

            if ($updated->count() === 0) {
                return response()->json(['success' => false, 'message' => 'Estudiante no encontrado.'], 404);
            }

            return $this->show($studentId);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Error al actualizar perfil.'], 500);
        }
    }
}