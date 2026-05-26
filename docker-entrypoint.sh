#!/bin/sh
set -e

echo "Esperando a que Neo4j este listo..."
until nc -z neo4j 7687; do
  sleep 2
done

if [ ! -f .env ]; then
    cp .env.example .env
fi

set_env_value() {
    key="$1"
    value="$2"

    if [ -z "$value" ]; then
        return
    fi

    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${value}|" .env
    else
        echo "${key}=${value}" >> .env
    fi
}

set_env_value APP_ENV "$APP_ENV"
set_env_value APP_DEBUG "$APP_DEBUG"
set_env_value APP_URL "$APP_URL"
set_env_value SESSION_DRIVER "$SESSION_DRIVER"
set_env_value CACHE_STORE "$CACHE_STORE"
set_env_value QUEUE_CONNECTION "$QUEUE_CONNECTION"
set_env_value SAPU_SERVICE "$SAPU_SERVICE"
set_env_value NEO4J_URI "$NEO4J_URI"
set_env_value NEO4J_USERNAME "$NEO4J_USERNAME"
set_env_value NEO4J_PASSWORD "$NEO4J_PASSWORD"
set_env_value NEO4J_DATABASE "$NEO4J_DATABASE"

if ! grep -q "^APP_KEY=" .env || grep -q "^APP_KEY=$" .env; then
    php artisan key:generate --force
fi

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --no-progress --prefer-dist
fi

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

exec "$@"
