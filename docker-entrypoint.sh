#!/bin/sh
set -e

# Ensure .env exists
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
  else
    echo ".env not found and .env.example missing" >&2
  fi
fi

# Try running migrations up to 10 times (some services may take time to be ready)
attempts=0
until php artisan migrate --force; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 10 ]; then
    echo "Migrations failed after $attempts attempts; continuing anyway." >&2
    break
  fi
  echo "Migration failed; retrying in 3s (attempt $attempts)..."
  sleep 3
done

exec "$@"
