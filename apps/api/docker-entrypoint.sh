#!/bin/sh
set -eu

# Migrations run only when RUN_DB_MIGRATE=true.
# A restart or a missing value must not migrate production.
if [ "${RUN_DB_MIGRATE:-false}" = "true" ]; then
  echo "[api] Running prisma migrate deploy..."
  cd /app
  ./node_modules/.bin/prisma migrate deploy --schema=packages/database/prisma
  cd /app/apps/api
fi

echo "[api] Starting Nest on PORT=${PORT:-8080}..."
exec node dist/main
