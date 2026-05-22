<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminPsychologistController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/admin/psychologists
     */
    public function index()
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo)
            OPTIONAL MATCH (p)-[:ATIENDE]->(c:Cita)
            OPTIONAL MATCH (p)-[:TIENE_DISPONIBILIDAD]->(d:Disponibilidad {fecha_dispo: \$today})
            WITH p,
                 count(DISTINCT c) AS totalCitas,
                 count(DISTINCT d) AS bloquesHoy
            RETURN 
                p.id_psicologo AS id,
                p.nombre AS name,
                p.correo_institucional AS email,
                p.especialidad AS specialty,
                p.estado AS status,
                p.experiencia AS experience,
                COALESCE(p.identificacion, '1000000000') AS identification,
                COALESCE(p.telefono, '3000000000') AS phone,
                totalCitas AS assignedPatients,
                bloquesHoy * 2 AS hoursToday,
                COALESCE(p.calificacion, 4.5) AS rating
            ORDER BY p.nombre
        ", ['today' => date('Y-m-d')]);

        $psychologists = [];
        foreach ($result as $row) {
            $name = $row->get('name');
            $initials = $this->initials($name);
            $psychologists[] = [
                'id'                => $row->get('id'),
                'name'              => $name,
                'email'             => $row->get('email'),
                'specialty'         => $row->get('specialty'),
                'status'            => $row->get('status') ?: 'Activo',
                'experience'        => (int) $row->get('experience'),
                'identification'    => $row->get('identification'),
                'phone'             => $row->get('phone'),
                'assignedPatients'  => (int) $row->get('assignedPatients'),
                'hoursToday'        => (int) $row->get('hoursToday'),
                'rating'            => (float) $row->get('rating'),
                'initials'          => $initials,
            ];
        }

        return response()->json(['success' => true, 'data' => $psychologists]);
    }

    /**
     * POST /api/admin/psychologists
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'identification' => 'required|string|max:20',
            'specialty'      => 'required|string|max:120',
            'email'          => 'required|email|max:255',
            'phone'          => 'nullable|string|max:30',
            'experience'     => 'required|integer|min:0|max:50',
            'status'         => 'required|in:Activo,Inactivo',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        // Generar nuevo id
        $maxId = $this->neo4j->run("MATCH (p:Psicologo) RETURN coalesce(max(p.id_psicologo), 0) AS maxId")
                    ->first()->get('maxId');
        $newId = $maxId + 1;

        $this->neo4j->run("
            CREATE (p:Psicologo {
                id_psicologo: \$id,
                nombre: \$name,
                identificacion: \$identification,
                especialidad: \$specialty,
                correo_institucional: \$email,
                telefono: \$phone,
                experiencia: \$experience,
                estado: \$status,
                calificacion: 5.0
            })
            RETURN p
        ", [
            'id'             => $newId,
            'name'           => $request->input('name'),
            'identification' => $request->input('identification'),
            'specialty'      => $request->input('specialty'),
            'email'          => $request->input('email'),
            'phone'          => $request->input('phone') ?? '3000000000',
            'experience'     => (int) $request->input('experience'),
            'status'         => $request->input('status'),
        ]);

        // Devolver el recurso creado
        return response()->json([
            'success' => true,
            'message' => 'Psicólogo registrado.',
            'data' => [
                'id'                => $newId,
                'name'              => $request->input('name'),
                'email'             => $request->input('email'),
                'specialty'         => $request->input('specialty'),
                'status'            => $request->input('status'),
                'experience'        => (int) $request->input('experience'),
                'identification'    => $request->input('identification'),
                'phone'             => $request->input('phone') ?? '3000000000',
                'assignedPatients'  => 0,
                'hoursToday'        => 0,
                'rating'            => 5.0,
                'initials'          => $this->initials($request->input('name')),
            ],
        ], 201);
    }

    /**
     * PUT /api/admin/psychologists/{id}
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'identification' => 'required|string|max:20',
            'specialty'      => 'required|string|max:120',
            'email'          => 'required|email|max:255',
            'phone'          => 'nullable|string|max:30',
            'experience'     => 'required|integer|min:0|max:50',
            'status'         => 'required|in:Activo,Inactivo',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $updated = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            SET p.nombre = \$name,
                p.identificacion = \$identification,
                p.especialidad = \$specialty,
                p.correo_institucional = \$email,
                p.telefono = \$phone,
                p.experiencia = \$experience,
                p.estado = \$status
            RETURN p
        ", [
            'id'             => (int) $id,
            'name'           => $request->input('name'),
            'identification' => $request->input('identification'),
            'specialty'      => $request->input('specialty'),
            'email'          => $request->input('email'),
            'phone'          => $request->input('phone') ?? '3000000000',
            'experience'     => (int) $request->input('experience'),
            'status'         => $request->input('status'),
        ]);

        if ($updated->count() === 0) {
            return response()->json(['success' => false, 'message' => 'Psicólogo no encontrado.'], 404);
        }

        $row = $updated->first();
        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado.',
            'data' => [
                'id'                => (int) $id,
                'name'              => $row->get('name') ?? $request->input('name'),
                'email'             => $row->get('email') ?? $request->input('email'),
                'specialty'         => $row->get('specialty') ?? $request->input('specialty'),
                'status'            => $row->get('status') ?? $request->input('status'),
                'experience'        => (int) ($row->get('experience') ?? $request->input('experience')),
                'identification'    => $row->get('identification') ?? $request->input('identification'),
                'phone'             => $row->get('phone') ?? $request->input('phone'),
                'assignedPatients'  => 0,  // no se actualiza aquí
                'hoursToday'        => 0,
                'rating'            => 5.0,
                'initials'          => $this->initials($row->get('name') ?? $request->input('name')),
            ],
        ]);
    }

    /**
     * PATCH /api/admin/psychologists/{id}/toggle-status
     */
    public function toggleStatus($id)
    {
        $updated = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            SET p.estado = CASE p.estado WHEN 'Activo' THEN 'Inactivo' ELSE 'Activo' END
            RETURN p
        ", ['id' => (int) $id]);

        if ($updated->count() === 0) {
            return response()->json(['success' => false, 'message' => 'Psicólogo no encontrado.'], 404);
        }

        $row = $updated->first();
        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado.',
            'data' => [
                'id'                => (int) $id,
                'name'              => $row->get('name'),
                'email'             => $row->get('email'),
                'specialty'         => $row->get('specialty'),
                'status'            => $row->get('status'),
                'experience'        => (int) $row->get('experience'),
                'identification'    => $row->get('identification'),
                'phone'             => $row->get('phone'),
                'assignedPatients'  => 0,
                'hoursToday'        => 0,
                'rating'            => 5.0,
                'initials'          => $this->initials($row->get('name')),
            ],
        ]);
    }

    /**
     * DELETE /api/admin/psychologists/{id}
     */
    public function destroy($id)
    {
        $deleted = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            DETACH DELETE p
            RETURN count(p) AS deletedCount
        ", ['id' => (int) $id])->first()->get('deletedCount');

        if ($deleted == 0) {
            return response()->json(['success' => false, 'message' => 'Psicólogo no encontrado.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Registro eliminado.']);
    }

    private function initials(string $name): string
    {
        $pieces = array_filter(explode(' ', trim($name)));
        if (count($pieces) < 2) return mb_strtoupper(mb_substr($name, 0, 2));
        return mb_strtoupper(mb_substr($pieces[0], 0, 1) . mb_substr($pieces[1], 0, 1));
    }
}