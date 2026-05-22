<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminStudentController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/admin/students
     */
    public function index()
    {
        $result = $this->neo4j->run("
            MATCH (e:Estudiante)
            OPTIONAL MATCH (e)-[:ASIGNA]->(a:Asignacion {vigencia: 'Vigente'})
            OPTIONAL MATCH (a)-[:CORRESPONDE]->(p:Psicologo)
            RETURN 
                e.id_estudiante AS id,
                e.nombre AS fullName,
                e.identificacion AS identification,
                e.programa_academico AS career,
                e.semestre AS semester,
                e.correo_institucional AS email,
                COALESCE(e.telefono, '+57 N/A') AS phone,
                e.estado_proceso_psicologico AS status,
                COALESCE(p.nombre, 'No asignado') AS psychologistName,
                COALESCE(p.correo_institucional, NULL) AS psychologistEmail,
                COALESCE(e.nivel_riesgo, 'Bajo') AS criticality,
                COALESCE(e.fecha_nacimiento, '2002-01-01') AS birthDate
            ORDER BY e.nombre
        ");

        $students = [];
        foreach ($result as $row) {
            $name = $row->get('fullName');
            $students[] = [
                'id'                => $row->get('id'),
                'fullName'          => $name,
                'initials'          => $this->initials($name),
                'identification'    => $row->get('identification'),
                'career'            => $row->get('career'),
                'semester'          => (int) $row->get('semester'),
                'email'             => $row->get('email'),
                'phone'             => $row->get('phone'),
                'status'            => $row->get('status') ?: 'Sin asignar',
                'psychologistName'  => $row->get('psychologistName'),
                'psychologistEmail' => $row->get('psychologistEmail'),
                'criticality'       => $row->get('criticality'),
                'birthDate'         => $row->get('birthDate'),
            ];
        }

        return response()->json(['success' => true, 'data' => $students]);
    }

    /**
     * POST /api/admin/students
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName'          => 'required|string|max:255',
            'identification'    => 'required|string|max:20',
            'career'            => 'required|string|max:120',
            'semester'          => 'required|integer|min:1|max:12',
            'email'             => 'required|email|max:255',
            'phone'             => 'nullable|string|max:30',
            'status'            => 'required|in:Sin asignar,En proceso,Terminado',
            'psychologistName'  => 'nullable|string|max:255',
            'psychologistEmail' => 'nullable|email|max:255',
            'criticality'       => 'required|in:Bajo,Medio,Alto',
            'birthDate'         => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $maxId = $this->neo4j->run(
            "MATCH (e:Estudiante) RETURN coalesce(max(e.id_estudiante), 0) AS maxId"
        )->first()->get('maxId');
        $newId = $maxId + 1;

        $this->neo4j->run("
            CREATE (e:Estudiante {
                id_estudiante: \$id,
                nombre: \$fullName,
                identificacion: \$identification,
                programa_academico: \$career,
                semestre: \$semester,
                correo_institucional: \$email,
                telefono: \$phone,
                estado_proceso_psicologico: \$status,
                nivel_riesgo: \$criticality,
                fecha_nacimiento: \$birthDate
            })
            RETURN e
        ", [
            'id'             => $newId,
            'fullName'       => $request->input('fullName'),
            'identification' => $request->input('identification'),
            'career'         => $request->input('career'),
            'semester'       => (int) $request->input('semester'),
            'email'          => $request->input('email'),
            'phone'          => $request->input('phone') ?? '+57 N/A',
            'status'         => $request->input('status'),
            'criticality'    => $request->input('criticality'),
            'birthDate'      => $request->input('birthDate') ?? '2002-01-01',
        ]);

        // Asignar psicólogo si corresponde
        if ($request->input('status') !== 'Sin asignar' && $request->input('psychologistName') !== 'No asignado') {
            $this->assignPsychologist($newId, $request->input('psychologistName'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Estudiante registrado.',
            'data'    => $this->studentData($newId, $request)
        ], 201);
    }

    /**
     * PUT /api/admin/students/{id}
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'fullName'          => 'required|string|max:255',
            'identification'    => 'required|string|max:20',
            'career'            => 'required|string|max:120',
            'semester'          => 'required|integer|min:1|max:12',
            'email'             => 'required|email|max:255',
            'phone'             => 'nullable|string|max:30',
            'status'            => 'required|in:Sin asignar,En proceso,Terminado',
            'psychologistName'  => 'nullable|string|max:255',
            'psychologistEmail' => 'nullable|email|max:255',
            'criticality'       => 'required|in:Bajo,Medio,Alto',
            'birthDate'         => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $updated = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$id})
            SET e.nombre = \$fullName,
                e.identificacion = \$identification,
                e.programa_academico = \$career,
                e.semestre = \$semester,
                e.correo_institucional = \$email,
                e.telefono = \$phone,
                e.estado_proceso_psicologico = \$status,
                e.nivel_riesgo = \$criticality,
                e.fecha_nacimiento = \$birthDate
            RETURN e
        ", [
            'id'             => (int) $id,
            'fullName'       => $request->input('fullName'),
            'identification' => $request->input('identification'),
            'career'         => $request->input('career'),
            'semester'       => (int) $request->input('semester'),
            'email'          => $request->input('email'),
            'phone'          => $request->input('phone') ?? '+57 N/A',
            'status'         => $request->input('status'),
            'criticality'    => $request->input('criticality'),
            'birthDate'      => $request->input('birthDate') ?? '2002-01-01',
        ]);

        if ($updated->count() === 0) {
            return response()->json(['success' => false, 'message' => 'Estudiante no encontrado.'], 404);
        }

        // Actualizar asignación
        $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$id})-[old:ASIGNA]->(:Asignacion)
            DELETE old
        ", ['id' => (int) $id]);

        if ($request->input('status') !== 'Sin asignar' && $request->input('psychologistName') !== 'No asignado') {
            $this->assignPsychologist((int) $id, $request->input('psychologistName'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Estudiante actualizado.',
            'data'    => $this->studentData((int) $id, $request)
        ]);
    }

    /**
     * DELETE /api/admin/students/{id}
     */
    public function destroy($id)
    {
        $deleted = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$id})
            DETACH DELETE e
            RETURN count(e) AS deletedCount
        ", ['id' => (int) $id])->first()->get('deletedCount');

        if ($deleted == 0) {
            return response()->json(['success' => false, 'message' => 'Estudiante no encontrado.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Estudiante eliminado.']);
    }

    // ─── Helpers ────────────────────────────────────────

    private function assignPsychologist(int $studentId, string $psychologistName): void
    {
        // Buscar psicólogo por nombre
        $psych = $this->neo4j->run("
            MATCH (p:Psicologo {nombre: \$name})
            RETURN p.id_psicologo AS id, p.nombre AS name, p.correo_institucional AS email
        ", ['name' => $psychologistName]);

        if ($psych->count() === 0) return;

        $psychData = $psych->first();
        $psychId = $psychData->get('id');

        // Crear asignación vigente
        $maxAsig = $this->neo4j->run(
            "MATCH (a:Asignacion) RETURN coalesce(max(a.id_asignacion), 0) AS maxId"
        )->first()->get('maxId');
        $newAsigId = $maxAsig + 1;

        $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$studentId})
            MATCH (p:Psicologo {id_psicologo: \$psychId})
            CREATE (a:Asignacion {
                id_asignacion: \$asigId,
                tipo_asignacion: 'Individual',
                fecha_inicio_as: date(),
                fecha_fin_as: date() + duration({months: 6}),
                vigencia: 'Vigente'
            })
            CREATE (e)-[:ASIGNA]->(a)
            CREATE (a)-[:CORRESPONDE]->(p)
        ", [
            'studentId' => $studentId,
            'psychId'   => $psychId,
            'asigId'    => $newAsigId,
        ]);
    }

    private function studentData(int $id, Request $request): array
    {
        $name = $request->input('fullName');
        return [
            'id'                => $id,
            'fullName'          => $name,
            'initials'          => $this->initials($name),
            'identification'    => $request->input('identification'),
            'career'            => $request->input('career'),
            'semester'          => (int) $request->input('semester'),
            'email'             => $request->input('email'),
            'phone'             => $request->input('phone') ?? '+57 N/A',
            'status'            => $request->input('status'),
            'psychologistName'  => $request->input('status') !== 'Sin asignar' ? $request->input('psychologistName') : 'No asignado',
            'psychologistEmail' => $request->input('status') !== 'Sin asignar' ? $request->input('psychologistEmail') : null,
            'criticality'       => $request->input('criticality'),
            'birthDate'         => $request->input('birthDate') ?? '2002-01-01',
        ];
    }

    private function initials(string $name): string
    {
        $pieces = array_filter(explode(' ', trim($name)));
        if (count($pieces) < 2) return mb_strtoupper(mb_substr($name, 0, 2));
        return mb_strtoupper(mb_substr($pieces[0], 0, 1) . mb_substr($pieces[1], 0, 1));
    }
}