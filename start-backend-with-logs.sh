#!/bin/bash

# Start Backend and Save Logs to File
# This way you can see all logs even if terminal scrolls

cd "$(dirname "$0")/backend"

LOG_FILE="../backend.log"

echo "🚀 Starting Backend and saving logs to: $LOG_FILE"
echo ""
echo "📋 Logs will be saved to: backend.log"
echo "   You can view them with: tail -f backend.log"
echo ""
echo "Starting backend..."
echo ""

# Load environment variables
if [ -f "../backend/.env" ]; then
    set -a
    source ../backend/.env
    set +a
    export GMAIL_ENABLED GMAIL_USER GMAIL_APP_PASS DYNAMO_ENDPOINT
fi

# Start backend and save logs to file
mvn spring-boot:run 2>&1 | tee "$LOG_FILE"

