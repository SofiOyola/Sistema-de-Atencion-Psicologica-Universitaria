<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * GoogleAuthController
 *
 * Maneja el flujo OAuth 2.0 de autenticación con Google
 * usando Laravel Socialite.
 *
 * Flujo completo:
 *   1. Usuario hace clic en "Continuar con Google" en el frontend.
 *   2. El frontend redirige a /auth/google/redirect (GET).
 *   3. Este controlador redirige a los servidores de Google.
 *   4. Google autentica al usuario y llama a /auth/google/callback.
 *   5. El controlador obtiene los datos, crea/actualiza el usuario
 *      en la base de datos e inicia la sesión de Laravel.
 *   6. Se redirige al usuario al panel de control de la SPA React.
 */
class GoogleAuthController extends Controller
{
    /**
     * redirectToGoogle()
     *
     * Redirige al usuario a la pantalla de consentimiento de Google.
     * Socialite construye automáticamente la URL OAuth con:
     *   - client_id   (desde .env → GOOGLE_CLIENT_ID)
     *   - redirect_uri (desde .env → GOOGLE_REDIRECT_URI)
     *   - scopes: openid, email, profile (por defecto en Socialite)
     *   - state: token CSRF aleatorio para prevenir ataques
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * handleGoogleCallback()
     *
     * Recibe el código de autorización que Google envía de vuelta
     * después de que el usuario acepta el consentimiento.
     *
     * Qué hace paso a paso:
     *   1. Llama a Socialite para intercambiar el código por un token
     *      y obtener los datos del usuario de Google.
     *   2. Busca en la BD si ya existe un usuario con ese google_id.
     *   3. Si no existe, lo busca por correo (el usuario puede haber
     *      creado una cuenta local previamente).
     *   4. Crea o actualiza el registro con updateOrCreate().
     *   5. Inicia la sesión con Auth::login().
     *   6. Redirige al dashboard de la SPA React (ruta "/").
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            // 1. Obtener los datos del usuario desde Google
            $googleUser = Socialite::driver('google')->user();

            // 2. Crear o actualizar el usuario en nuestra base de datos.
            //    - Busca primero por google_id (login recurrente).
            //    - Si no lo encuentra, busca o crea por email
            //      (merge de cuenta local con SSO).
            $user = User::updateOrCreate(
                [
                    // Clave de búsqueda: el ID único de Google
                    'google_id' => $googleUser->getId(),
                ],
                [
                    // Datos a actualizar/insertar en cada login
                    'name'              => $googleUser->getName(),
                    'email'             => $googleUser->getEmail(),
                    'avatar'            => $googleUser->getAvatar(),
                    'email_verified_at' => now(), // Google ya verificó el correo
                    // password queda null — usuario solo usa SSO
                ]
            );

            // 3. Iniciar sesión en Laravel con el usuario encontrado/creado.
            //    Auth::login() crea la sesión del servidor y la cookie
            //    de sesión en el navegador del usuario.
            Auth::login($user, remember: true);

            // 4. Redirigir al dashboard de la SPA React.
            //    Como todas las rutas del frontend las maneja React Router,
            //    redirigimos a "/" y React Router mostrará el dashboard.
            return redirect('/');

        } catch (Throwable $e) {
            // Si Google devuelve error o el usuario cancela el consentimiento,
            // redirigimos al login con un mensaje descriptivo.
            return redirect('/')
                ->withErrors(['google' => 'No se pudo completar la autenticación con Google. Inténtalo de nuevo.']);
        }
    }
}
