#!/usr/bin/env bash
# Seed databases with development/test data.
# Blocked in production.

set -euo pipefail

ENVIRONMENT="${NODE_ENV:-development}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ "$ENVIRONMENT" == "production" ]]; then
  echo "[seed] ERROR: Seeding is not allowed in production." >&2
  exit 1
fi

log() { echo "[seed] $*"; }
log "Seeding for environment: $ENVIRONMENT"

SEED_SCRIPT="$ROOT_DIR/backend/auth-service/dist/database/seeds/seed.js"
if [[ -f "$SEED_SCRIPT" ]]; then
  node "$SEED_SCRIPT" && log "auth-service seed: OK" || log "auth-service seed: FAILED"
else
  log "No seed script found. Build auth-service first."
fi

log "Seed complete."
