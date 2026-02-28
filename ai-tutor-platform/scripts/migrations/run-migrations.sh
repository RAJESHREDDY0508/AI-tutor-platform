#!/usr/bin/env bash
# Run TypeORM database migrations for all backend services.
# Called via: yarn migrate from repo root.

set -euo pipefail

SERVICES=("auth-service" "session-service" "curriculum-service" "homework-service" "analytics-service" "payment-service")
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

log() { echo "[migrate] $*"; }

for service in "${SERVICES[@]}"; do
  SERVICE_DIR="$ROOT_DIR/backend/$service"
  MIGRATION_SCRIPT="$SERVICE_DIR/dist/database/migrations"

  if [[ -d "$MIGRATION_SCRIPT" ]]; then
    log "Running migrations for $service..."
    (cd "$SERVICE_DIR" && yarn typeorm migration:run -d dist/config/database.config.js) \
      && log "$service: OK" \
      || log "$service: FAILED"
  else
    log "$service: No compiled migrations found – run 'yarn build' first"
  fi
done

log "Migration run complete."
