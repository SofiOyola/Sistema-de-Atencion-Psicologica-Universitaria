<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PsychologistProfileController extends Controller
{
    use ResolvesApiUser;

    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/psychologist/profile
     */
    public function show(Request $request)
    {
        $psychologistId = $this->psychologistIdFromRequest($request);
        if (!$psychologistId) {
            return $this->unauthenticatedResponse();
        }

        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            OPTIONAL MATCH (u:User {psychologist_id: p.id_psicologo})
            RETURN p.nombre AS fullName,
                   p.correo_institucional AS email,
                   p.id_psicologo AS psychologistId,
                   p.especialidad AS specialty,
                   p.experiencia AS experience,
                   p.estado AS status,
                   p.descripcion AS description,
                   p.telefono AS phone,
                   p.ubicacion AS location,
                   p.intereses AS interests,
                   p.contacto_emergencia AS emergencyContact
        ", ['id' => $psychologistId]);

        if ($result->count() === 0) {
            return response()->json(['message' => 'Psicólogo no encontrado'], 404);
        }

        $record = $result->first();
        $profile = [
            'fullName'         => $record->get('fullName'),
            'email'            => $record->get('email'),
            'psychologistId'   => $record->get('psychologistId'),
            'specialty'        => $record->get('specialty'),
            'experience'       => $record->get('experience'),
            'status'           => $record->get('status'),
            'description'      => $record->get('description'),
            'phone'            => $record->get('phone'),
            'location'         => $record->get('location'),
            'interests'        => $record->get('interests'),
            'emergencyContact' => $record->get('emergencyContact'),
        ];

        return response()->json(['success' => true, 'psychologist' => $profile]);
    }

    /**
     * PUT /api/psychologist/profile
     */
    public function update(Request $request)
    {
        $psychologistId = $this->psychologistIdFromRequest($request);
        if (!$psychologistId) {
            return $this->unauthenticatedResponse();
        }

        $validator = Validator::make($request->all(), [
            'specialty'        => 'nullable|string|max:120',
            'experience'       => 'nullable|integer|min:0|max:50',
            'description'      => 'nullable|string|max:500',
            'phone'            => 'nullable|string|max:30',
            'location'         => 'nullable|string|max:120',
            'interests'        => 'nullable|string|max:300',
            'emergencyContact' => 'nullable|string|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $params = [
            'id'                => $psychologistId,
            'specialty'         => $request->input('specialty'),
            'experience'        => $request->input('experience'),
            'description'       => $request->input('description'),
            'phone'             => $request->input('phone'),
            'location'          => $request->input('location'),
            'interests'         => $request->input('interests'),
            'emergencyContact'  => $request->input('emergencyContact'),
        ];

        $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            SET p.especialidad = coalesce(\$specialty, p.especialidad),
                p.experiencia = coalesce(\$experience, p.experiencia),
                p.descripcion = coalesce(\$description, p.descripcion),
                p.telefono = coalesce(\$phone, p.telefono),
                p.ubicacion = coalesce(\$location, p.ubicacion),
                p.intereses = coalesce(\$interests, p.intereses),
                p.contacto_emergencia = coalesce(\$emergencyContact, p.contacto_emergencia)
            RETURN p
        ", $params);

        // Retornar el perfil actualizado
        return $this->show($request);
    }
}
