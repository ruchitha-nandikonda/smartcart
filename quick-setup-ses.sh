#!/bin/bash

# Quick AWS SES Setup Script
# This script helps you set up AWS SES step by step

echo "🚀 SmartCart AWS SES Quick Setup"
echo "================================="
echo ""

# Step 1: Get AWS Region
echo "Step 1: AWS Region"
echo "------------------"
read -p "Enter AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}
echo "✅ Region: $AWS_REGION"
echo ""

# Step 2: Get Email Address
echo "Step 2: Email Address"
echo "---------------------"
read -p "Enter your Gmail address: " EMAIL
echo "✅ Email: $EMAIL"
echo ""

# Step 3: Get AWS Credentials
echo "Step 3: AWS Credentials"
echo "----------------------"
echo "If you don't have AWS credentials yet:"
echo "1. Go to: https://console.aws.amazon.com/iam/"
echo "2. Create a new IAM user"
echo "3. Attach 'AmazonSESFullAccess' policy"
echo "4. Create access key"
echo ""
read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -sp "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo ""
echo "✅ Credentials entered"
echo ""

# Step 4: Create .env file
echo "Step 4: Creating Configuration File"
echo "------------------------------------"
ENV_FILE="backend/.env"

cat > "$ENV_FILE" << EOF
# AWS Configuration
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

# SES Configuration
AWS_SES_ENABLED=true
AWS_SES_FROM_EMAIL=$EMAIL
EOF

echo "✅ Created $ENV_FILE"
echo ""

# Step 5: Instructions
echo "Step 5: Next Steps"
echo "------------------"
echo "1. Verify your email in AWS SES:"
echo "   https://console.aws.amazon.com/ses/"
echo "   - Go to 'Verified identities'"
echo "   - Click 'Create identity'"
echo "   - Enter: $EMAIL"
echo "   - Check your email and click verification link"
echo ""
echo "2. Load environment variables:"
echo "   source backend/.env"
echo ""
echo "3. Start your backend:"
echo "   cd backend && mvn spring-boot:run"
echo ""
echo "4. Test registration with your email: $EMAIL"
echo ""
echo "✅ Setup complete!"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Don't commit .env file to git!"
echo "   - Keep your AWS credentials secure"
echo "   - In sandbox mode, you can only send to verified emails"
echo ""




