#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# AWS SES Setup Helper Script for SmartCart
# This script helps you configure AWS SES for email sending

echo "🚀 SmartCart AWS SES Setup Helper"
echo "=================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed."
    echo "   Install it from: https://aws.amazon.com/cli/"
    echo ""
fi

# Function to check if environment variable is set
check_env_var() {
    if [ -z "${!1}" ]; then
        echo "❌ $1 is not set"
        return 1
    else
        echo "✅ $1 is set"
        return 0
    fi
}

echo "📋 Checking Configuration..."
echo ""

# Check required environment variables
MISSING_VARS=0

if ! check_env_var "AWS_REGION"; then
    MISSING_VARS=$((MISSING_VARS + 1))
fi

if ! check_env_var "AWS_ACCESS_KEY_ID"; then
    MISSING_VARS=$((MISSING_VARS + 1))
fi

if ! check_env_var "AWS_SECRET_ACCESS_KEY"; then
    MISSING_VARS=$((MISSING_VARS + 1))
fi

if ! check_env_var "AWS_SES_ENABLED"; then
    MISSING_VARS=$((MISSING_VARS + 1))
fi

if ! check_env_var "AWS_SES_FROM_EMAIL"; then
    MISSING_VARS=$((MISSING_VARS + 1))
fi

echo ""

if [ $MISSING_VARS -eq 0 ]; then
    echo "✅ All environment variables are set!"
    echo ""
    echo "📧 Configuration Summary:"
    echo "   Region: $AWS_REGION"
    echo "   From Email: $AWS_SES_FROM_EMAIL"
    echo "   SES Enabled: $AWS_SES_ENABLED"
    echo ""
    
    # Test AWS credentials if AWS CLI is available
    if command -v aws &> /dev/null; then
        echo "🔍 Testing AWS credentials..."
        if aws sts get-caller-identity &> /dev/null; then
            echo "✅ AWS credentials are valid!"
            echo ""
            
            # Check SES verification status
            echo "📬 Checking SES email verification status..."
            if aws ses get-identity-verification-attributes --identities "$AWS_SES_FROM_EMAIL" --region "$AWS_REGION" &> /dev/null; then
                VERIFICATION_STATUS=$(aws ses get-identity-verification-attributes --identities "$AWS_SES_FROM_EMAIL" --region "$AWS_REGION" 2>/dev/null | grep -o '"VerificationStatus":"[^"]*"' | cut -d'"' -f4)
                if [ "$VERIFICATION_STATUS" = "Success" ]; then
                    echo "✅ Email $AWS_SES_FROM_EMAIL is verified in AWS SES!"
                else
                    echo "⚠️  Email $AWS_SES_FROM_EMAIL is not verified yet."
                    echo "   Please verify it in AWS SES Console: https://console.aws.amazon.com/ses/"
                fi
            else
                echo "⚠️  Could not check verification status. Make sure SES is enabled in region $AWS_REGION"
            fi
        else
            echo "❌ AWS credentials are invalid or not configured properly"
        fi
    fi
    
    echo ""
    echo "🎉 Setup complete! You can now start your backend server."
    echo "   Run: cd backend && mvn spring-boot:run"
else
    echo "❌ Missing $MISSING_VARS environment variable(s)"
    echo ""
    echo "📝 Quick Setup Instructions:"
    echo ""
    echo "1. Create AWS account: https://aws.amazon.com/"
    echo "2. Go to AWS SES Console: https://console.aws.amazon.com/ses/"
    echo "3. Verify your email address"
    echo "4. Create IAM user with SES permissions"
    echo "5. Set environment variables:"
    echo ""
    echo "   export AWS_REGION=us-east-1"
    echo "   export AWS_ACCESS_KEY_ID=your_access_key_id"
    echo "   export AWS_SECRET_ACCESS_KEY=your_secret_access_key"
    echo "   export AWS_SES_ENABLED=true"
    echo "   export AWS_SES_FROM_EMAIL=yourname@gmail.com"
    echo ""
    echo "6. Run this script again to verify"
    echo ""
    echo "📖 For detailed instructions, see: AWS_SES_SETUP.md"
fi

echo ""
echo "=================================="




