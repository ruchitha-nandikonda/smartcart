#!/bin/bash

# Interactive AWS SES Setup Wizard
# This will guide you through setting up AWS SES step by step

echo "🚀 SmartCart AWS SES Setup Wizard"
echo "=================================="
echo ""
echo "I'll help you set up AWS SES to send OTP emails to Gmail."
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed."
    echo ""
    echo "Would you like to install it? (y/n)"
    read -r INSTALL_CLI
    if [ "$INSTALL_CLI" = "y" ] || [ "$INSTALL_CLI" = "Y" ]; then
        echo ""
        echo "Installing AWS CLI..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install awscli
            else
                echo "Please install Homebrew first: https://brew.sh/"
                echo "Then run: brew install awscli"
                exit 1
            fi
        else
            echo "Please install AWS CLI manually: https://aws.amazon.com/cli/"
            exit 1
        fi
    fi
fi

echo ""
echo "📋 Step 1: AWS Account Setup"
echo "-----------------------------"
echo ""
echo "Do you have an AWS account? (y/n)"
read -r HAS_AWS_ACCOUNT

if [ "$HAS_AWS_ACCOUNT" != "y" ] && [ "$HAS_AWS_ACCOUNT" != "Y" ]; then
    echo ""
    echo "📝 You'll need to create an AWS account first:"
    echo "   1. Go to: https://aws.amazon.com/"
    echo "   2. Click 'Create an AWS Account'"
    echo "   3. Follow the signup process"
    echo ""
    echo "Press Enter when you've created your AWS account..."
    read -r
fi

echo ""
echo "📋 Step 2: Verify Your Email in AWS SES"
echo "----------------------------------------"
echo ""
echo "We need to verify your Gmail address in AWS SES."
echo ""
read -p "Enter your Gmail address: " GMAIL_ADDRESS

echo ""
echo "✅ Got it! Now let's verify your email:"
echo ""
echo "1. Open this link: https://console.aws.amazon.com/ses/"
echo "2. Make sure you're in 'us-east-1' region (top right)"
echo "3. Click 'Verified identities' → 'Create identity'"
echo "4. Select 'Email address'"
echo "5. Enter: $GMAIL_ADDRESS"
echo "6. Click 'Create identity'"
echo "7. Check your Gmail inbox for verification email"
echo "8. Click the verification link"
echo ""
echo "Press Enter when you've verified your email..."
read -r

echo ""
echo "📋 Step 3: Create AWS Access Keys"
echo "----------------------------------"
echo ""
echo "We need to create AWS access keys for the backend to send emails."
echo ""
echo "1. Open this link: https://console.aws.amazon.com/iam/"
echo "2. Click 'Users' → 'Create user'"
echo "3. Username: smartcart-ses-user"
echo "4. Click 'Next'"
echo "5. Click 'Attach policies directly'"
echo "6. Search for: AmazonSESFullAccess"
echo "7. Select it → Click 'Next' → 'Create user'"
echo "8. Click on the user → 'Security credentials' tab"
echo "9. Click 'Create access key'"
echo "10. Select 'Application running outside AWS'"
echo "11. Click 'Next' → 'Create access key'"
echo "12. COPY BOTH keys (you'll only see the secret once!)"
echo ""
echo "Press Enter when you have your access keys ready..."
read -r

echo ""
read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -sp "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo ""

echo ""
read -p "Enter AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

echo ""
echo "📋 Step 4: Creating Configuration File"
echo "---------------------------------------"
echo ""

# Create .env file
ENV_FILE="backend/.env"
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

# Add to .gitignore if not already there
if [ -f ".gitignore" ]; then
    if ! grep -q "backend/.env" .gitignore; then
        echo "backend/.env" >> .gitignore
        echo "✅ Added backend/.env to .gitignore"
    fi
else
    echo "backend/.env" > .gitignore
    echo "✅ Created .gitignore"
fi

echo ""
echo "📋 Step 5: Testing Configuration"
echo "--------------------------------"
echo ""

# Load environment variables
export AWS_REGION=$AWS_REGION
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export AWS_SES_ENABLED=true
export AWS_SES_FROM_EMAIL=$GMAIL_ADDRESS

# Test AWS credentials if AWS CLI is available
if command -v aws &> /dev/null; then
    echo "Testing AWS credentials..."
    if aws sts get-caller-identity &> /dev/null; then
        echo "✅ AWS credentials are valid!"
        echo ""
        
        # Check SES verification
        echo "Checking email verification status..."
        VERIFICATION=$(aws ses get-identity-verification-attributes --identities "$GMAIL_ADDRESS" --region "$AWS_REGION" 2>/dev/null)
        if echo "$VERIFICATION" | grep -q "Success"; then
            echo "✅ Email $GMAIL_ADDRESS is verified!"
        else
            echo "⚠️  Email $GMAIL_ADDRESS is not verified yet."
            echo "   Please complete the verification step."
        fi
    else
        echo "❌ AWS credentials test failed. Please check your keys."
    fi
else
    echo "⚠️  AWS CLI not available. Skipping credential test."
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Make sure your email ($GMAIL_ADDRESS) is verified in AWS SES"
echo "2. Load the environment variables:"
echo "   source backend/.env"
echo ""
echo "3. Start your backend:"
echo "   cd backend"
echo "   mvn spring-boot:run"
echo ""
echo "4. Test registration with: $GMAIL_ADDRESS"
echo "5. Check your Gmail inbox for the OTP!"
echo ""
echo "⚠️  Important:"
echo "   - Don't commit backend/.env to git (already added to .gitignore)"
echo "   - Keep your AWS credentials secure"
echo "   - In sandbox mode, you can only send to verified emails"
echo ""
echo "✅ Configuration saved to: backend/.env"
echo ""





