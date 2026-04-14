#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# Start Backend - You'll See All Logs Here!
# Run this script and you'll see the backend terminal output

cd "$(dirname "$0")/backend"

echo "🚀 Starting SmartCart Backend"
echo "=============================="
echo ""
echo "📺 ALL LOGS WILL APPEAR BELOW!"
echo ""
echo "You'll see:"
echo "  ✅ Spring Boot startup messages"
echo "  ✅ 'Started SmartCartApplication'"
echo "  ✅ All email sending logs when you register"
echo ""
echo "💡 When you register, watch for:"
echo "  - '=== ATTEMPTING TO SEND EMAIL ==='"
echo "  - 'JavaMailSender: Available'"
echo "  - '✅ Email sent successfully' OR error messages"
echo ""
echo "Press Ctrl+C to stop the backend"
echo ""
echo "=========================================="
echo ""

# Load environment variables
if [ -f "../backend/.env" ]; then
    echo "📋 Loading Gmail configuration..."
    set -a
    source ../backend/.env
    set +a
    export GMAIL_ENABLED GMAIL_USER GMAIL_APP_PASS DYNAMO_ENDPOINT
    echo "✅ Configuration loaded"
    echo ""
fi

# Start Spring Boot - logs will appear here!
mvn spring-boot:run

