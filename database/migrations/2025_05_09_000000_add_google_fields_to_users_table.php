<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración: add_google_fields_to_users_table
 *
 * Añade las columnas necesarias para soportar autenticación
 * con Google SSO a través de Laravel Socialite.
 *
 * Columnas:
 *   - google_id: ID único del usuario en Google. Nullable para
 *     no romper cuentas que se registren de forma tradicional.
 *   - avatar: URL del avatar de perfil que devuelve Google.
 *   - password: se vuelve nullable para usuarios SSO que nunca
 *     crean una contraseña local.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Google devuelve un ID de tipo string numérico muy largo
            $table->string('google_id')->nullable()->unique()->after('id');

            // URL de la foto de perfil de Google
            $table->string('avatar')->nullable()->after('google_id');

            // Los usuarios SSO no tienen contraseña local
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'avatar']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
