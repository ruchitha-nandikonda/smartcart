#!/bin/bash

# Start Backend with Gmail Configuration
# This script ensures environment variables are properly loaded

cd "$(dirname "$0")/backend"

echo "🚀 Starting SmartCart Backend with Gmail SMTP..."
echo ""

# Load environment variables from .env file
if [ -f "../backend/.env" ]; then
    echo "📋 Loading environment variables from .env..."
    set -a  # Automatically export all variables
    source ../backend/.env
    set +a  # Turn off automatic export
    
    echo "✅ Environment variables loaded:"
    echo "   GMAIL_ENABLED=$GMAIL_ENABLED"
    echo "   GMAIL_USER=$GMAIL_USER"
    echo "   GMAIL_APP_PASS=${GMAIL_APP_PASS:0:4}****"
    echo "   DYNAMO_ENDPOINT=$DYNAMO_ENDPOINT"
    echo ""
else
    echo "⚠️  Warning: ../backend/.env not found"
    echo ""
fi

# Export variables explicitly (in case set -a didn't work)
export GMAIL_ENABLED
export GMAIL_USER
export GMAIL_APP_PASS
export DYNAMO_ENDPOINT

# Verify critical variables
if [ -z "$GMAIL_USER" ] || [ -z "$GMAIL_APP_PASS" ]; then
    echo "❌ Error: Gmail credentials not found!"
    echo "   Please check backend/.env file"
    exit 1
fi

echo "🔍 Verifying Spring Mail configuration..."
echo "   Spring Boot will use these environment variables:"
echo "   - spring.mail.username = \$GMAIL_USER"
echo "   - spring.mail.password = \$GMAIL_APP_PASS"
echo ""

echo "⏳ Starting Spring Boot application..."
echo "   Watch for 'Started SmartCartApplication' when ready"
echo ""

# Start Spring Boot
mvn spring-boot:run





