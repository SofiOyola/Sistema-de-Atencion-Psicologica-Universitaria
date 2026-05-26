<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReactController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Services\Neo4jService;

$service = env('SAPU_SERVICE', 'monolith');
$registerService = static fn (string $name): bool => $service === 'monolith' || $service === $name;

if ($registerService('auth')) {
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle'])
        ->name('google.redirect');

    Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback'])
        ->name('google.callback');
}

if ($service === 'monolith') {
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
}

if ($registerService('frontend')) {
    Route::get('/{any?}', [ReactController::class, 'index'])->where('any', '.*');
}
