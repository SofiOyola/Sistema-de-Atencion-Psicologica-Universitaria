<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            'password_confirmation' => ['nullable', 'string', 'min:8'],
            'program' => ['nullable', 'string', 'max:255'],
            'programa' => ['nullable', 'string', 'max:255'],
            'identification' => ['nullable', 'string', 'max:50'],
            'identificacion' => ['nullable', 'string', 'max:50'],
        ]);

        $program = $data['programa'] ?? $data['program'] ?? null;
        $identification = $data['identificacion'] ?? $data['identification'] ?? null;

        if (
            isset($data['password_confirmation'])
            && $data['password_confirmation'] !== $data['password']
        ) {
            return response()->json([
                'message' => 'La confirmacion de contrasena no coincide.',
                'errors' => [
                    'password_confirmation' => ['La confirmacion de contrasena no coincide.'],
                ],
            ], 422);
        }

        $existing = $this->neo4j->run(
            '
            MATCH (u)
            WHERE (u:User OR u:Usuario)
              AND (u.email = $email OR u.correo_institucional = $email)
            RETURN u LIMIT 1
            ',
            ['email' => $data['email']]
        );

        if (count($existing->toArray()) > 0) {
            return response()->json([
                'message' => 'Ya existe una cuenta con este correo.',
            ], 422);
        }

        $hashedPassword = Hash::make($data['password']);
        $params = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $hashedPassword,
            'programa' => $program,
            'identificacion' => $identification,
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ];

        $created = $this->neo4j->run(
            '
            OPTIONAL MATCH (existingUser:User)
            WITH coalesce(max(existingUser.id_usuario), 0) + 1 AS newUserId
            OPTIONAL MATCH (existingStudent:Estudiante)
            WITH newUserId, coalesce(max(existingStudent.id_estudiante), 0) + 1 AS newStudentId
            CREATE (e:Estudiante {
                id_estudiante: newStudentId,
                nombre: $name,
                identificacion: $identificacion,
                correo_institucional: $email,
                programa_academico: $programa,
                estado_proceso_psicologico: "Pendiente"
            })
            CREATE (u:User:Usuario {
                id_usuario: newUserId,
                name: $name,
                nombre: $name,
                email: $email,
                password: $password,
                role: "student",
                student_id: newStudentId,
                programa: $programa,
                identificacion: $identificacion,
                correo_institucional: $email,
                contrasena: $password,
                created_at: $created_at,
                updated_at: $updated_at,
                fecha_creacion: $created_at,
                ultimo_acceso: null
            })
            CREATE (e)-[:TIENE]->(u)
            RETURN e.id_estudiante AS studentId
            ',
            $params
        );

        $studentId = $created->first()->get('studentId');

        return response()->json([
            'message' => 'Registro exitoso.',
            'user' => [
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => 'student',
                'studentId' => $studentId,
                'programa' => $program,
                'identificacion' => $identification,
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
            '
            MATCH (u)
            WHERE (u:User OR u:Usuario)
              AND (u.email = $email OR u.correo_institucional = $email)
            OPTIONAL MATCH (e:Estudiante)-[:TIENE]->(u)
            OPTIONAL MATCH (p:Psicologo)-[:TIENE]->(u)
            OPTIONAL MATCH (a:Administrador)-[:TIENE]->(u)
            RETURN u,
                   coalesce(
                       u.role,
                       CASE
                           WHEN e IS NOT NULL THEN "student"
                           WHEN p IS NOT NULL THEN "psychologist"
                           WHEN a IS NOT NULL THEN "admin"
                           ELSE "student"
                       END
                   ) AS role,
                   e.id_estudiante AS studentId,
                   p.id_psicologo AS psychologistId,
                   a.id_administrativo AS adminId
            LIMIT 1
            ',
            ['email' => $data['email']]
        );

        $records = $result->toArray();
        if (count($records) === 0) {
            return response()->json(['message' => 'Credenciales invalidas.'], 401);
        }

        $record = $records[0];
        $userNode = $record->get('u');
        $storedHash = $userNode->getProperty('password') ?? $userNode->getProperty('contrasena');

        if (!$storedHash || !Hash::check($data['password'], $storedHash)) {
            return response()->json(['message' => 'Credenciales invalidas.'], 401);
        }

        $email = $userNode->getProperty('email') ?? $userNode->getProperty('correo_institucional') ?? $data['email'];
        $name = $userNode->getProperty('name') ?? $userNode->getProperty('nombre') ?? '';
        $role = $record->get('role') ?? 'student';

        return response()->json([
            'message' => 'Inicio de sesion exitoso.',
            'token' => $this->issueToken($email, $role),
            'user' => [
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'studentId' => $record->get('studentId'),
                'psychologistId' => $record->get('psychologistId'),
                'adminId' => $record->get('adminId'),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Sesion cerrada correctamente.',
        ]);
    }

    private function issueToken(string $email, string $role): string
    {
        $payload = base64_encode(json_encode([
            'email' => $email,
            'role' => $role,
            'iat' => time(),
        ]));

        $signature = hash_hmac('sha256', $payload, (string) config('app.key'));

        return $payload . '.' . $signature;
    }
}
