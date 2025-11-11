#!/bin/bash

# Gmail App Password Update Script
# This helps you update your Gmail App Password in .env

echo "📧 Gmail App Password Update"
echo "=============================="
echo ""

# Check if .env exists
ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: backend/.env not found!"
    exit 1
fi

echo "Current Gmail configuration:"
grep -E "^GMAIL_" "$ENV_FILE" | sed 's/=.*/=***/'
echo ""

echo "⚠️  IMPORTANT:"
echo "   Gmail App Passwords must be:"
echo "   - Exactly 16 characters"
echo "   - No spaces"
echo "   - Only letters and numbers"
echo ""

echo "📋 Steps to get App Password:"
echo "   1. Go to: https://myaccount.google.com/apppasswords"
echo "   2. Select: Mail → Other → Name: SmartCartOTP"
echo "   3. Click Generate"
echo "   4. Copy the 16-character password (remove spaces)"
echo ""

read -sp "Enter your NEW 16-character Gmail App Password: " NEW_PASSWORD
echo ""

# Validate password length
if [ ${#NEW_PASSWORD} -ne 16 ]; then
    echo "❌ Error: Password must be exactly 16 characters!"
    echo "   Your password is ${#NEW_PASSWORD} characters."
    exit 1
fi

# Validate password format (only alphanumeric)
if [[ ! "$NEW_PASSWORD" =~ ^[a-zA-Z0-9]+$ ]]; then
    echo "❌ Error: Password must contain only letters and numbers!"
    echo "   No spaces, @, or special characters allowed."
    exit 1
fi

echo "✅ Password format is valid!"
echo ""

# Backup .env
cp "$ENV_FILE" "$ENV_FILE.backup"
echo "📦 Created backup: $ENV_FILE.backup"
echo ""

# Update GMAIL_APP_PASS in .env
if grep -q "^GMAIL_APP_PASS=" "$ENV_FILE"; then
    # Update existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^GMAIL_APP_PASS=.*/GMAIL_APP_PASS=$NEW_PASSWORD/" "$ENV_FILE"
    else
        # Linux
        sed -i "s/^GMAIL_APP_PASS=.*/GMAIL_APP_PASS=$NEW_PASSWORD/" "$ENV_FILE"
    fi
    echo "✅ Updated GMAIL_APP_PASS in $ENV_FILE"
else
    # Add new line
    echo "GMAIL_APP_PASS=$NEW_PASSWORD" >> "$ENV_FILE"
    echo "✅ Added GMAIL_APP_PASS to $ENV_FILE"
fi

echo ""
echo "✅ Configuration updated!"
echo ""
echo "📋 Next Steps:"
echo "   1. Restart your backend"
echo "   2. Try registering a new account"
echo "   3. Check backend logs for: '✅ Email sent successfully via Gmail SMTP'"
echo "   4. Check your Gmail inbox for the OTP"
echo ""
echo "💡 To restart backend:"
echo "   cd backend"
echo "   source ../backend/.env"
echo "   mvn spring-boot:run"
echo ""





