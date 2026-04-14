#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# Helper script to check AWS SES email verification status
# This helps verify if your email is ready to receive OTPs

echo "🔍 Checking AWS SES Email Verification Status"
echo "============================================="
echo ""

# Load environment variables if .env exists
if [ -f "backend/.env" ]; then
    source backend/.env
    echo "✅ Loaded configuration from backend/.env"
    echo ""
else
    echo "❌ backend/.env file not found"
    echo "   Please run the setup script first"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed."
    echo "   Install it with: brew install awscli"
    echo ""
    echo "📝 Manual Verification:"
    echo "   1. Go to: https://console.aws.amazon.com/ses/"
    echo "   2. Click 'Verified identities'"
    echo "   3. Look for: $AWS_SES_FROM_EMAIL"
    echo "   4. Status should be 'Verified'"
    exit 0
fi

# Configure AWS CLI temporarily
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION=$AWS_REGION

echo "📧 Checking verification status for: $AWS_SES_FROM_EMAIL"
echo "📍 Region: $AWS_REGION"
echo ""

# Check verification status
VERIFICATION_OUTPUT=$(aws ses get-identity-verification-attributes \
    --identities "$AWS_SES_FROM_EMAIL" \
    --region "$AWS_REGION" 2>&1)

if echo "$VERIFICATION_OUTPUT" | grep -q "Success"; then
    echo "✅ Email is VERIFIED in AWS SES!"
    echo ""
    echo "🎉 You're ready to send OTP emails!"
    echo ""
    echo "Next step: Start your backend server"
    echo "   cd backend && mvn spring-boot:run"
elif echo "$VERIFICATION_OUTPUT" | grep -q "Pending"; then
    echo "⚠️  Email verification is PENDING"
    echo ""
    echo "📝 Action needed:"
    echo "   1. Check your Gmail inbox: $AWS_SES_FROM_EMAIL"
    echo "   2. Look for email from AWS SES"
    echo "   3. Click the verification link"
    echo ""
    echo "Or verify manually:"
    echo "   https://console.aws.amazon.com/ses/"
elif echo "$VERIFICATION_OUTPUT" | grep -q "NotFound"; then
    echo "❌ Email is NOT verified yet"
    echo ""
    echo "📝 Steps to verify:"
    echo "   1. Go to: https://console.aws.amazon.com/ses/"
    echo "   2. Make sure you're in region: $AWS_REGION"
    echo "   3. Click 'Verified identities' → 'Create identity'"
    echo "   4. Enter: $AWS_SES_FROM_EMAIL"
    echo "   5. Check your email and click verification link"
else
    echo "⚠️  Could not check verification status"
    echo ""
    echo "Error details:"
    echo "$VERIFICATION_OUTPUT" | head -5
    echo ""
    echo "📝 Please verify manually:"
    echo "   https://console.aws.amazon.com/ses/"
fi

echo ""





