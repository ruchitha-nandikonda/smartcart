#!/bin/bash

# Interactive Gmail Setup and Test Script
# This will guide you through fixing Gmail App Password and testing email

echo "🔧 Gmail Email Setup & Test"
echo "============================"
echo ""

ENV_FILE="backend/.env"

# Step 1: Check current configuration
echo "Step 1: Checking current configuration..."
echo ""

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: backend/.env not found!"
    exit 1
fi

CURRENT_PASS=$(grep "^GMAIL_APP_PASS=" "$ENV_FILE" | cut -d'=' -f2)
CURRENT_USER=$(grep "^GMAIL_USER=" "$ENV_FILE" | cut -d'=' -f2)

echo "Current settings:"
echo "  Gmail User: $CURRENT_USER"
echo "  App Password: ${CURRENT_PASS:0:4}**** (hidden)"
echo ""

# Check if password looks valid
if [ ${#CURRENT_PASS} -ne 16 ] || [[ "$CURRENT_PASS" =~ [^a-zA-Z0-9] ]]; then
    echo "⚠️  WARNING: Current password doesn't look like a valid Gmail App Password!"
    echo "   Length: ${#CURRENT_PASS} characters (should be 16)"
    echo "   Contains invalid characters: $(echo "$CURRENT_PASS" | grep -o '[^a-zA-Z0-9]' | sort -u | tr '\n' ' ')"
    echo ""
fi

# Step 2: Guide user to create App Password
echo "Step 2: Create Gmail App Password"
echo "----------------------------------"
echo ""
echo "📋 Follow these steps:"
echo ""
echo "1. Open this link in your browser:"
echo "   👉 https://myaccount.google.com/apppasswords"
echo ""
echo "2. If prompted, sign in to your Google Account"
echo ""
echo "3. Select:"
echo "   - App: Mail"
echo "   - Device: Other (Custom name)"
echo "   - Name: SmartCartOTP"
echo ""
echo "4. Click 'Generate'"
echo ""
echo "5. You'll see a 16-character password like:"
echo "   xxxx xxxx xxxx xxxx"
echo ""
echo "6. COPY that password (you'll only see it once!)"
echo ""
read -p "Press Enter when you have copied the App Password..."

echo ""
echo "Step 3: Enter your App Password"
echo "--------------------------------"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Must be exactly 16 characters"
echo "   - Remove ALL spaces"
echo "   - Only letters and numbers"
echo ""

read -sp "Paste your 16-character App Password here: " NEW_PASSWORD
echo ""

# Validate
if [ ${#NEW_PASSWORD} -ne 16 ]; then
    echo ""
    echo "❌ Error: Password must be exactly 16 characters!"
    echo "   Your password is ${#NEW_PASSWORD} characters."
    echo ""
    echo "💡 Tip: Make sure you removed all spaces from the password"
    exit 1
fi

if [[ ! "$NEW_PASSWORD" =~ ^[a-zA-Z0-9]+$ ]]; then
    echo ""
    echo "❌ Error: Password must contain only letters and numbers!"
    echo "   No spaces, @, or special characters allowed."
    exit 1
fi

echo ""
echo "✅ Password format is valid!"
echo ""

# Step 4: Update .env
echo "Step 4: Updating configuration..."
echo ""

# Backup
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "📦 Created backup of .env file"

# Update password
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/^GMAIL_APP_PASS=.*/GMAIL_APP_PASS=$NEW_PASSWORD/" "$ENV_FILE"
else
    sed -i "s/^GMAIL_APP_PASS=.*/GMAIL_APP_PASS=$NEW_PASSWORD/" "$ENV_FILE"
fi

echo "✅ Updated GMAIL_APP_PASS in $ENV_FILE"
echo ""

# Step 5: Verify configuration
echo "Step 5: Verifying configuration..."
echo ""

if grep -q "^GMAIL_ENABLED=true" "$ENV_FILE" && \
   grep -q "^GMAIL_USER=" "$ENV_FILE" && \
   grep -q "^GMAIL_APP_PASS=" "$ENV_FILE"; then
    echo "✅ Gmail configuration looks good!"
    echo ""
    echo "Current settings:"
    grep -E "^GMAIL_" "$ENV_FILE" | sed 's/=.*/=***/' | sed 's/GMAIL_USER=/GMAIL_USER=/' | head -1
    grep -E "^GMAIL_" "$ENV_FILE" | sed 's/GMAIL_APP_PASS=.*/GMAIL_APP_PASS=***/' | tail -1
else
    echo "⚠️  Warning: Some Gmail settings might be missing"
fi

echo ""
echo "Step 6: Next Steps"
echo "------------------"
echo ""
echo "✅ Configuration updated!"
echo ""
echo "📋 To test email sending:"
echo ""
echo "1. Restart your backend:"
echo "   cd backend"
echo "   source ../backend/.env"
echo "   mvn spring-boot:run"
echo ""
echo "2. Register a new account"
echo ""
echo "3. Check backend logs for:"
echo "   '✅ Email sent successfully via Gmail SMTP'"
echo ""
echo "4. Check your Gmail inbox for the OTP email"
echo ""
echo "💡 The yellow banner will show the OTP until emails work!"
echo ""





