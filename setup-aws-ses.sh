#!/bin/bash

# Automated AWS SES Setup Helper
# This script helps you complete the AWS SES setup

set -e

echo "🚀 SmartCart AWS SES Setup Assistant"
echo "======================================"
echo ""

# Step 1: Check AWS Account
echo "📋 Step 1: AWS Account"
echo "----------------------"
echo ""
echo "Do you have an AWS account? (y/n)"
read -r HAS_ACCOUNT

if [ "$HAS_ACCOUNT" != "y" ] && [ "$HAS_ACCOUNT" != "Y" ]; then
    echo ""
    echo "📝 Creating AWS Account..."
    echo ""
    echo "Please follow these steps:"
    echo "1. Open: https://aws.amazon.com/"
    echo "2. Click 'Create an AWS Account' (top right)"
    echo "3. Enter your email and choose a password"
    echo "4. Complete the verification process"
    echo "5. Add payment method (required, but free tier won't charge)"
    echo "6. Complete identity verification"
    echo ""
    echo "⏳ This usually takes 5-10 minutes"
    echo ""
    echo "Press Enter when you've created your AWS account..."
    read -r
    echo "✅ Great! Let's continue..."
else
    echo "✅ Good! You have an AWS account."
fi

echo ""
echo "📋 Step 2: Get Your Gmail Address"
echo "----------------------------------"
echo ""
read -p "Enter your Gmail address (e.g., yourname@gmail.com): " GMAIL_ADDRESS

# Validate email format (basic check)
if [[ ! "$GMAIL_ADDRESS" =~ ^[a-zA-Z0-9._%+-]+@gmail\.com$ ]]; then
    echo "⚠️  Warning: That doesn't look like a Gmail address, but continuing anyway..."
fi

echo "✅ Using email: $GMAIL_ADDRESS"
echo ""

echo "📋 Step 3: Verify Email in AWS SES"
echo "-----------------------------------"
echo ""
echo "Now we need to verify your email in AWS SES."
echo ""
echo "📝 Instructions:"
echo "1. Open this link in your browser:"
echo "   👉 https://console.aws.amazon.com/ses/"
echo ""
echo "2. Make sure you're logged into AWS"
echo ""
echo "3. Select region 'US East (N. Virginia)' from the top right dropdown"
echo "   (This is the 'us-east-1' region)"
echo ""
echo "4. Click 'Verified identities' in the left sidebar"
echo ""
echo "5. Click the orange 'Create identity' button"
echo ""
echo "6. Select 'Email address'"
echo ""
echo "7. Enter your email: $GMAIL_ADDRESS"
echo ""
echo "8. Click 'Create identity'"
echo ""
echo "9. Check your Gmail inbox for a verification email from AWS"
echo ""
echo "10. Click the verification link in the email"
echo ""
echo ""
echo "⏳ Take your time - I'll wait here!"
echo ""
echo "Press Enter when you've verified your email..."
read -r

echo ""
echo "✅ Great! Email verification step complete."
echo ""

echo "📋 Step 4: Create AWS Access Keys"
echo "----------------------------------"
echo ""
echo "Now we need to create access keys so the backend can send emails."
echo ""
echo "📝 Instructions:"
echo ""
echo "1. Open this link in your browser:"
echo "   👉 https://console.aws.amazon.com/iam/"
echo ""
echo "2. Click 'Users' in the left sidebar"
echo ""
echo "3. Click the orange 'Create user' button"
echo ""
echo "4. Enter username: smartcart-ses-user"
echo ""
echo "5. Click 'Next'"
echo ""
echo "6. Click 'Attach policies directly'"
echo ""
echo "7. In the search box, type: AmazonSESFullAccess"
echo ""
echo "8. Check the box next to 'AmazonSESFullAccess'"
echo ""
echo "9. Click 'Next'"
echo ""
echo "10. Click 'Create user'"
echo ""
echo "11. Click on the user name 'smartcart-ses-user'"
echo ""
echo "12. Click the 'Security credentials' tab"
echo ""
echo "13. Scroll down and click 'Create access key'"
echo ""
echo "14. Select 'Application running outside AWS'"
echo ""
echo "15. Click 'Next'"
echo ""
echo "16. Click 'Create access key'"
echo ""
echo "17. IMPORTANT: Copy both keys now (you'll only see the secret once!):"
echo "    - Access key ID"
echo "    - Secret access key"
echo ""
echo ""
echo "⏳ Ready? Press Enter when you have both keys copied..."
read -r

echo ""
echo "Now let's enter your keys:"
echo ""
read -p "Paste your Access Key ID: " AWS_ACCESS_KEY_ID
read -sp "Paste your Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo ""
echo ""

# Get region
read -p "Enter AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

echo ""
echo "📋 Step 5: Creating Configuration"
echo "----------------------------------"
echo ""

# Create .env file
ENV_FILE="backend/.env"
mkdir -p backend

cat > "$ENV_FILE" << EOF
# AWS Configuration
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

# SES Configuration
AWS_SES_ENABLED=true
AWS_SES_FROM_EMAIL=$GMAIL_ADDRESS
EOF

echo "✅ Created configuration file: $ENV_FILE"
echo ""

# Ensure .gitignore includes .env
if [ -f ".gitignore" ]; then
    if ! grep -q "^backend/.env$" .gitignore && ! grep -q "^backend/\.env$" .gitignore; then
        echo "backend/.env" >> .gitignore
        echo "✅ Added backend/.env to .gitignore"
    fi
else
    echo "backend/.env" > .gitignore
    echo "✅ Created .gitignore"
fi

echo ""
echo "📋 Step 6: Testing Configuration"
echo "---------------------------------"
echo ""

# Export variables for testing
export AWS_REGION=$AWS_REGION
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export AWS_SES_ENABLED=true
export AWS_SES_FROM_EMAIL=$GMAIL_ADDRESS

# Test with AWS CLI if available
if command -v aws &> /dev/null; then
    echo "Testing AWS credentials..."
    
    # Configure AWS CLI temporarily
    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID" --profile smartcart-test 2>/dev/null || true
    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY" --profile smartcart-test 2>/dev/null || true
    aws configure set region "$AWS_REGION" --profile smartcart-test 2>/dev/null || true
    
    if AWS_PROFILE=smartcart-test aws sts get-caller-identity &> /dev/null; then
        echo "✅ AWS credentials are valid!"
        echo ""
        
        echo "Checking email verification status..."
        VERIFICATION_OUTPUT=$(AWS_PROFILE=smartcart-test aws ses get-identity-verification-attributes --identities "$GMAIL_ADDRESS" --region "$AWS_REGION" 2>&1)
        
        if echo "$VERIFICATION_OUTPUT" | grep -q "Success"; then
            echo "✅ Email $GMAIL_ADDRESS is verified in AWS SES!"
        elif echo "$VERIFICATION_OUTPUT" | grep -q "Pending"; then
            echo "⚠️  Email $GMAIL_ADDRESS verification is still pending."
            echo "   Please check your email and click the verification link."
        else
            echo "⚠️  Could not verify email status. Please double-check:"
            echo "   1. Email is verified in AWS SES Console"
            echo "   2. You're using the correct region ($AWS_REGION)"
        fi
        
        # Clean up test profile
        aws configure --profile smartcart-test set aws_access_key_id "" 2>/dev/null || true
        aws configure --profile smartcart-test set aws_secret_access_key "" 2>/dev/null || true
    else
        echo "❌ AWS credentials test failed."
        echo "   Please check your Access Key ID and Secret Access Key."
    fi
else
    echo "⚠️  AWS CLI not installed. Skipping credential test."
    echo "   Your configuration is saved, but please verify manually."
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📝 Summary:"
echo "   ✅ Email: $GMAIL_ADDRESS"
echo "   ✅ Region: $AWS_REGION"
echo "   ✅ Configuration saved to: backend/.env"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Load the environment variables:"
echo "   source backend/.env"
echo ""
echo "2. Start your backend server:"
echo "   cd backend"
echo "   mvn spring-boot:run"
echo ""
echo "3. Test registration:"
echo "   - Go to your registration page"
echo "   - Register with: $GMAIL_ADDRESS"
echo "   - Check your Gmail inbox for the OTP!"
echo ""
echo "⚠️  Important Reminders:"
echo "   - Make sure your email ($GMAIL_ADDRESS) is verified in AWS SES"
echo "   - In sandbox mode, you can only send to verified emails"
echo "   - Don't commit backend/.env to git (already in .gitignore)"
echo "   - Keep your AWS credentials secure"
echo ""
echo "✅ You're all set! Ready to send OTP emails to Gmail! 🎉"
echo ""





