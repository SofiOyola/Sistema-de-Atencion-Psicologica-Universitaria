#!/bin/sh
set -e

# Espera a que Neo4j esté disponible (opcional, pero útil)
echo "Esperando a que Neo4j esté listo..."
until nc -z neo4j 7687; do
  sleep 2
done

# Crear .env si no existe
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Generar clave de aplicación si no está configurada
if ! grep -q "^APP_KEY=" .env || grep -q "^APP_KEY=$" .env; then
    php artisan key:generate --force
fi

# Instalar dependencias de Composer solo si no están ya instaladas
if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --no-progress --prefer-dist
fi

# Ajustar permisos de storage y cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Ejecutar el comando pasado como argumento (por defecto php artisan serve)
exec "$@"