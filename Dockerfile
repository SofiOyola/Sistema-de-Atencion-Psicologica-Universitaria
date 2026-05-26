# ── Etapa de dependencias PHP ──
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-progress \
    --no-dev \
    --no-scripts

# Instalar laravel/pail (requerido por el bootstrap de la aplicación)
RUN composer require --no-interaction --no-scripts laravel/pail

# ── Etapa de construcción del frontend ──
FROM node:22 AS node_build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --silent
COPY resources resources
COPY vite.config.js .
RUN npm run build

# ── Imagen final ──
FROM php:8.2-cli

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    git zip unzip curl libzip-dev libpng-dev libonig-dev libxml2-dev ca-certificates gnupg2 netcat-openbsd && \
    docker-php-ext-install pdo pdo_mysql mbstring zip exif bcmath pcntl posix && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# 1. Copiar el código fuente (excepto lo excluido en .dockerignore)
COPY . /var/www/html

# 2. Sobrescribir vendor con las dependencias compiladas
COPY --from=vendor /app/vendor /var/www/html/vendor

# 3. Sobrescribir los assets del frontend
COPY --from=node_build /app/public/build /var/www/html/public/build

# ── Permisos y preparación ──
RUN mkdir -p storage/framework/cache/data \
             storage/framework/sessions \
             storage/framework/views \
             storage/logs && \
    chmod -R 777 storage bootstrap/cache

# Generar APP_KEY si no existe (no destructivo)
RUN php -r "file_exists('.env') || copy('.env.example', '.env');" && \
    php artisan key:generate --ansi || true

# ── Entrypoint ──
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
