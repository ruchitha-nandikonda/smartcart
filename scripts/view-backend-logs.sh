#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# View Backend Logs
# This helps you see what's happening with the backend

echo "📺 Backend Log Viewer"
echo "====================="
echo ""

# Check if backend is running
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8080"
    echo ""
    echo "To see logs, you need to:"
    echo "  1. Find the terminal where backend was started"
    echo "  2. OR restart backend in foreground (see below)"
    echo ""
else
    echo "⚠️  Backend doesn't seem to be running"
    echo ""
    echo "Starting backend in foreground so you can see logs..."
    echo ""
    cd backend
    source ../backend/.env 2>/dev/null || true
    export GMAIL_ENABLED GMAIL_USER GMAIL_APP_PASS DYNAMO_ENDPOINT
    mvn spring-boot:run
fi

