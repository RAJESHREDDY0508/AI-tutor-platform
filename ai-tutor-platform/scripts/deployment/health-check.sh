#!/usr/bin/env bash
# Verify all services are healthy after a deployment.
# Usage: DEPLOY_HOST=staging.ai-tutor.io ./health-check.sh

set -euo pipefail

HOST="${DEPLOY_HOST:-localhost}"
MAX_RETRIES=12
RETRY_DELAY=5

declare -A SERVICES=(
  ["frontend"]="3000:/health"
  ["auth-service"]="8001:/v1/health"
  ["session-service"]="8002:/v1/health"
  ["curriculum-service"]="8003:/v1/health"
  ["homework-service"]="8004:/v1/health"
  ["analytics-service"]="8005:/v1/health"
  ["payment-service"]="8006:/v1/health"
  ["llm-wrapper"]="5001:/health"
  ["vector-db"]="5002:/health"
  ["prompt-engine"]="5003:/health"
  ["safety-guardrails"]="5004:/health"
)

FAILED=0

check_service() {
  local name=$1 port=$2 path=$3
  local url="http://$HOST:$port$path"
  local attempt=0

  while [[ $attempt -lt $MAX_RETRIES ]]; do
    if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
      echo "[health-check] ✓  $name  ($url)"
      return 0
    fi
    attempt=$((attempt + 1))
    echo "[health-check] ·  $name not ready yet (attempt $attempt/$MAX_RETRIES)"
    sleep "$RETRY_DELAY"
  done

  echo "[health-check] ✗  $name FAILED after $MAX_RETRIES attempts"
  return 1
}

for name in "${!SERVICES[@]}"; do
  entry="${SERVICES[$name]}"
  port="${entry%%:*}"
  path="${entry##*:}"
  check_service "$name" "$port" "$path" || FAILED=$((FAILED + 1))
done

if [[ $FAILED -gt 0 ]]; then
  echo "[health-check] $FAILED service(s) unhealthy"
  exit 1
fi

echo "[health-check] All services healthy."
