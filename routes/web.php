<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReactController;
use App\Http\Controllers\Auth\GoogleAuthController;

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

/*
|--------------------------------------------------------------------------
| Catch-all → React SPA
|--------------------------------------------------------------------------
| Captura TODAS las demás rutas y devuelve la vista Blade base
| para que React Router tome el control del frontend.
*/
Route::get('/{any?}', [ReactController::class, 'index'])->where('any', '.*');
