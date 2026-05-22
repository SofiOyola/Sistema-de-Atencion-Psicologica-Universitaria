<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminSettingsController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/admin/settings/profile
     */
    public function getProfile(Request $request)
    {
        // Asumimos que el admin autenticado es el de id_administrativo = 1
        $adminId = $request->user()->admin_id ?? 1;

        $result = $this->neo4j->run("
            MATCH (a:Administrador {id_administrativo: \$id})
            RETURN a.nombre AS fullName,
                   a.correo_institucional AS email,
                   a.cargo AS position,
                   a.departamento AS department,
                   COALESCE(a.descripcion, '') AS description,
                   COALESCE(a.telefono, '') AS phone,
                   COALESCE(a.ubicacion, '') AS location,
                   a.nivel_acceso AS role
        ", ['id' => (int) $adminId]);

        if ($result->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Administrador no encontrado.'
            ], 404);
        }

        $row = $result->first();
        $profile = [
            'fullName'    => $row->get('fullName'),
            'email'       => $row->get('email'),
            'position'    => $row->get('position'),
            'department'  => $row->get('department'),
            'description' => $row->get('description'),
            'phone'       => $row->get('phone'),
            'location'    => $row->get('location'),
            'role'        => $row->get('role') ?? 'Director General',
            'avatar'      => '/images/doctor_avatar.png',  // o null
        ];

        return response()->json(['success' => true, 'data' => $profile]);
    }

    /**
     * PUT /api/admin/settings/profile
     */
    public function updateProfile(Request $request)
    {
        $adminId = $request->user()->admin_id ?? 1;

        $validator = Validator::make($request->all(), [
            'department'  => 'required|string|max:120',
            'position'    => 'required|string|max:120',
            'description' => 'nullable|string|max:500',
            'phone'       => 'nullable|string|max:30',
            'location'    => 'nullable|string|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $this->neo4j->run("
            MATCH (a:Administrador {id_administrativo: \$id})
            SET a.departamento = \$department,
                a.cargo = \$position,
                a.descripcion = \$description,
                a.telefono = \$phone,
                a.ubicacion = \$location
            RETURN a
        ", [
            'id'          => (int) $adminId,
            'department'  => $request->input('department'),
            'position'    => $request->input('position'),
            'description' => $request->input('description') ?? '',
            'phone'       => $request->input('phone') ?? '',
            'location'    => $request->input('location') ?? '',
        ]);

        // Retornar el perfil actualizado
        return $this->getProfile($request);
    }
}