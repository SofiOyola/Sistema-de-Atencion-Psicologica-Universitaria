<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

trait ResolvesApiUser
{
    private function psychologistIdFromRequest(Request $request): ?int
    {
        $user = $request->user();

        if ($user?->psychologist_id) {
            return (int) $user->psychologist_id;
        }

        $token = $request->bearerToken();
        if (!$token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);
        $email = $accessToken?->tokenable?->email;

        if (!$email) {
            return null;
        }

        $result = $this->neo4j->run(
            '
            MATCH (u:User {email: $email})
            OPTIONAL MATCH (p:Psicologo)-[:TIENE]->(u)
            RETURN p.id_psicologo AS psychologistId
            LIMIT 1
            ',
            ['email' => $email]
        );

        if ($result->count() === 0) {
            return null;
        }

        $psychologistId = $result->first()->get('psychologistId');

        return $psychologistId !== null ? (int) $psychologistId : null;
    }

    private function unauthenticatedResponse()
    {
        return response()->json([
            'success' => false,
            'message' => 'No autenticado.',
        ], 401);
    }
}
