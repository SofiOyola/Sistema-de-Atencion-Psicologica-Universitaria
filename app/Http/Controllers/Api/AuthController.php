<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    protected Neo4jService $neo4j;

    public function __construct(Neo4jService $neo4j)
    {
        $this->neo4j = $neo4j;
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
            'programa' => ['nullable', 'string', 'max:255'],
            'identificacion' => ['nullable', 'string', 'max:50'],
        ]);

        $existing = $this->neo4j->run(
            'MATCH (u:User {email: $email}) RETURN u LIMIT 1',
            ['email' => $data['email']]
        );

        $existingRecords = $existing->toArray();
        if (count($existingRecords) > 0) {
            return response()->json([
                'message' => 'Ya existe una cuenta con este correo.',
            ], 422);
        }

        $hashedPassword = Hash::make($data['password']);
        $params = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $hashedPassword,
            'programa' => $data['programa'] ?? null,
            'identificacion' => $data['identificacion'] ?? null,
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ];

        $this->neo4j->run(
            'CREATE (u:User {name: $name, email: $email, password: $password, programa: $programa, identificacion: $identificacion, created_at: $created_at, updated_at: $updated_at}) RETURN u',
            $params
        );

        $localUser = User::updateOrCreate(
            ['email' => $data['email']],
            ['name' => $data['name'], 'password' => $hashedPassword]
        );

        return response()->json([
            'message' => 'Registro exitoso.',
            'user' => [
                'name' => $localUser->name,
                'email' => $localUser->email,
                'programa' => $data['programa'] ?? null,
                'identificacion' => $data['identificacion'] ?? null,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $result = $this->neo4j->run(
            'MATCH (u:User {email: $email}) RETURN u LIMIT 1',
            ['email' => $data['email']]
        );

        $records = $result->toArray();
        if (count($records) === 0) {
            return response()->json(['message' => 'Credenciales inválidas.'], 401);
        }

        $record = $records[0];

        $userNode = $record->get('u');
        $storedHash = $userNode->getProperty('password');

        if (!Hash::check($data['password'], $storedHash)) {
            return response()->json(['message' => 'Credenciales inválidas.'], 401);
        }

        $localUser = User::updateOrCreate(
            ['email' => $data['email']],
            ['name' => $userNode->getProperty('name'), 'password' => $storedHash]
        );

        $token = $localUser->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'token' => $token,
            'user' => [
                'name' => $localUser->name,
                'email' => $localUser->email,
            ],
        ]);
    }
}
