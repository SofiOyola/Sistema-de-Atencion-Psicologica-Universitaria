<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReactController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Services\Neo4jService;

/*
|--------------------------------------------------------------------------
| Rutas de Google OAuth (SSO)
|--------------------------------------------------------------------------
| IMPORTANTE: estas rutas deben declararse ANTES del catch-all de React.
| Si el wildcard va primero, intercepta /auth/google/* y Laravel nunca
| llega a estas rutas — React mostraría "página no encontrada".
|
| /auth/google/redirect  → Le dice a Socialite que redirija a Google.
| /auth/google/callback  → Google llama aquí con el código de autorización.
*/
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle'])
    ->name('google.redirect');

Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback'])
    ->name('google.callback');


Route::get('/debug-neo4j-env', function () {
    return response()->json([
        'uri' => env('NEO4J_URI'),
        'username' => env('NEO4J_USERNAME'),
        'database' => env('NEO4J_DATABASE'),
        'password_length' => strlen(env('NEO4J_PASSWORD') ?? ''),
        'password_starts_with' => substr(env('NEO4J_PASSWORD') ?? '', 0, 2),
        'password_ends_with' => substr(env('NEO4J_PASSWORD') ?? '', -2),
    ]);
});

Route::get('/test-neo4j', function (Neo4jService $neo4j) {
    try {
        $result = $neo4j->run('MATCH (n) RETURN count(n) AS total');

        return response()->json([
            'success' => true,
            'total' => $result->first()->get('total')
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

/*
|--------------------------------------------------------------------------
| Catch-all → React SPA
|--------------------------------------------------------------------------
| Captura TODAS las demás rutas y devuelve la vista Blade base
| para que React Router tome el control del frontend.
*/
Route::get('/{any?}', [ReactController::class, 'index'])->where('any', '.*');

