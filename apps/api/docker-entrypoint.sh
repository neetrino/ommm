#!/bin/sh
set -eu

# Optional idempotent migrate before boot (safe with Prisma advisory locks).
# Set RUN_DB_MIGRATE=false in Coolify if you run migrations as a one-shot instead.
if [ "${RUN_DB_MIGRATE:-true}" = "true" ]; then
  echo "[api] Running prisma migrate deploy..."
  cd /app
  ./node_modules/.bin/prisma migrate deploy --schema=packages/database/prisma
  cd /app/apps/api
fi

echo "[api] Starting Nest on PORT=${PORT:-8080}..."
exec node dist/main
