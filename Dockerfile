### Builder stage for PHP dependencies (composer)
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock* ./
COPY . .
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-progress

### Node build stage for frontend assets
FROM node:22 AS node_build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --silent
# Copy only the resources and vite config needed to build assets
COPY resources resources
COPY vite.config.js .
RUN npm run build

### Final runtime image
FROM php:8.2-cli

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    git zip unzip curl libzip-dev libpng-dev libonig-dev libxml2-dev ca-certificates gnupg2 && \
    docker-php-ext-install pdo pdo_mysql mbstring zip exif bcmath && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy vendor from builder
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy built assets from node build
COPY --from=node_build /app/public/build /var/www/html/public/build

# Copy application files
COPY . /var/www/html

# Ensure Laravel cache directories exist and are writable
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs && \
    chmod -R 777 storage bootstrap/cache

# Ensure env exists and generate key if needed (non-destructive)
RUN php -r "file_exists('.env') || copy('.env.example', '.env');" && php artisan key:generate --ansi || true

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

EXPOSE 8000

# Copy entrypoint and make executable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
