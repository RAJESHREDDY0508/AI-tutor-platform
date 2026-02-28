#!/usr/bin/env bash
# Tag and push all Docker images to a container registry.
# Usage: ./tag-and-push.sh <registry-url> <tag>
# Example: ./tag-and-push.sh 123456.dkr.ecr.us-east-1.amazonaws.com/ai-tutor 1.2.3

set -euo pipefail

REGISTRY="${1:?Registry URL is required as first argument}"
TAG="${2:?Image tag is required as second argument}"

SERVICES=(
  "frontend"
  "auth-service"
  "session-service"
  "curriculum-service"
  "homework-service"
  "analytics-service"
  "payment-service"
  "llm-wrapper"
  "vector-db"
  "prompt-engine"
  "safety-guardrails"
)

log() { echo "[push] $*"; }
FAILED=0

for service in "${SERVICES[@]}"; do
  local_image="ai-tutor-$service:latest"
  remote_image="$REGISTRY/$service:$TAG"

  log "Tagging $local_image → $remote_image"
  docker tag "$local_image" "$remote_image" || { log "FAILED to tag $service"; FAILED=$((FAILED+1)); continue; }

  log "Pushing $remote_image"
  docker push "$remote_image" || { log "FAILED to push $service"; FAILED=$((FAILED+1)); continue; }

  log "$service pushed ✓"
done

if [[ $FAILED -gt 0 ]]; then
  log "$FAILED image(s) failed. Check output above."
  exit 1
fi

log "All images pushed with tag: $TAG"
