#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. On Mac, open Docker Desktop and wait until it is ready, then run this script again."
  exit 1
fi

echo "Starting DynamoDB Local on http://127.0.0.1:8000 ..."
docker compose up dynamodb-local -d
echo "Done. DynamoDB Local should be up. Start the backend with:"
echo "  cd backend && SPRING_PROFILES_ACTIVE=local JWT_SECRET=local-dev-secret-at-least-32-characters-long mvn spring-boot:run"
