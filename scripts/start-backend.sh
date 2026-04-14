#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# Start SmartCart Backend with AWS SES Configuration
# This script loads environment variables and starts the backend

set -e

echo "🚀 Starting SmartCart Backend with AWS SES"
echo "==========================================="
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file not found!"
    echo ""
    echo "Please run the setup script first:"
    echo "   ./scripts/setup-aws-ses.sh"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
source backend/.env

echo "✅ Configuration loaded:"
echo "   Email: $AWS_SES_FROM_EMAIL"
echo "   Region: $AWS_REGION"
echo "   SES Enabled: $AWS_SES_ENABLED"
echo ""

# Check verification status
echo "🔍 Checking email verification status..."
if command -v aws &> /dev/null; then
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY
    export AWS_DEFAULT_REGION=$AWS_REGION
    
    VERIFICATION=$(aws ses get-identity-verification-attributes \
        --identities "$AWS_SES_FROM_EMAIL" \
        --region "$AWS_REGION" 2>&1)
    
    if echo "$VERIFICATION" | grep -q "Success"; then
        echo "✅ Email is verified - Ready to send emails!"
    else
        echo "⚠️  WARNING: Email may not be verified yet"
        echo "   Run: ./scripts/check-ses-status.sh to check status"
        echo "   Or verify at: https://console.aws.amazon.com/ses/"
        echo ""
        read -p "Continue anyway? (y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
            echo "Exiting. Please verify your email first."
            exit 1
        fi
    fi
else
    echo "⚠️  AWS CLI not installed - skipping verification check"
    echo "   Make sure your email is verified in AWS SES Console"
fi

echo ""
echo "📦 Starting backend server..."
echo ""

# Change to backend directory and start
cd backend
mvn spring-boot:run





