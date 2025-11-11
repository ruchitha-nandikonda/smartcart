#!/bin/bash

# Gmail SMTP Quick Setup Script
# This helps you configure Gmail for sending OTP emails

echo "📧 SmartCart Gmail SMTP Setup"
echo "=============================="
echo ""

echo "Step 1: Gmail Account Setup"
echo "---------------------------"
echo ""
echo "Choose a Gmail address for SmartCart:"
echo "   Option 1: smartcart.app@gmail.com (Recommended)"
echo "   Option 2: noreply.smartcart@gmail.com"
echo "   Option 3: smartcart.verify@gmail.com"
echo "   Option 4: Your own choice"
echo ""
read -p "Enter Gmail address: " GMAIL_ADDRESS

echo ""
echo "Step 2: Create Gmail Account (if needed)"
echo "------------------------------------------"
echo ""
echo "If you haven't created the account yet:"
echo "   1. Go to: https://accounts.google.com/signup"
echo "   2. Create account: $GMAIL_ADDRESS"
echo "   3. Complete verification"
echo ""
read -p "Press Enter when account is created and verified..."

echo ""
echo "Step 3: Enable 2-Step Verification"
echo "-------------------------------------"
echo ""
echo "1. Go to: https://myaccount.google.com/security"
echo "2. Find '2-Step Verification'"
echo "3. Click 'Get started'"
echo "4. Follow setup process"
echo "5. Verify with your phone"
echo ""
read -p "Press Enter when 2-Step Verification is enabled..."

echo ""
echo "Step 4: Create App Password"
echo "----------------------------"
echo ""
echo "1. Go to: https://myaccount.google.com/apppasswords"
echo "   (Or: Google Account → Security → 2-Step Verification → App passwords)"
echo ""
echo "2. Select app: 'Mail'"
echo ""
echo "3. Select device: 'Other (Custom name)'"
echo "   - Enter name: SmartCartOTP"
echo "   - Click 'Generate'"
echo ""
echo "4. COPY the 16-character password (shown only once!)"
echo "   Format: xxxx xxxx xxxx xxxx"
echo ""
read -sp "Paste your App Password here (remove spaces): " GMAIL_APP_PASS
echo ""

echo ""
echo "Step 5: Updating Configuration"
echo "-------------------------------"
echo ""

# Update .env file
ENV_FILE="backend/.env"

if [ -f "$ENV_FILE" ]; then
    # Remove old Gmail config if exists
    sed -i.bak '/^GMAIL_/d' "$ENV_FILE" 2>/dev/null || sed -i '' '/^GMAIL_/d' "$ENV_FILE" 2>/dev/null || true
fi

# Add Gmail configuration
cat >> "$ENV_FILE" << EOF

# Gmail SMTP Configuration
GMAIL_ENABLED=true
GMAIL_USER=$GMAIL_ADDRESS
GMAIL_APP_PASS=$GMAIL_APP_PASS
EOF

echo "✅ Updated $ENV_FILE"
echo ""

# Show configuration
echo "📋 Configuration Added:"
echo "   GMAIL_ENABLED=true"
echo "   GMAIL_USER=$GMAIL_ADDRESS"
echo "   GMAIL_APP_PASS=${GMAIL_APP_PASS:0:4}****"
echo ""

echo "Step 6: Next Steps"
echo "------------------"
echo ""
echo "1. Restart your backend:"
echo "   - Stop current backend (Ctrl+C)"
echo "   - Run: source backend/.env"
echo "   - Run: cd backend && mvn spring-boot:run"
echo ""
echo "2. Test registration:"
echo "   - Register with any email address"
echo "   - Check inbox for OTP email!"
echo ""
echo "✅ Gmail SMTP setup complete!"
echo ""
echo "💡 Benefits:"
echo "   ✅ Can send to ANY email address"
echo "   ✅ No AWS SES production access needed"
echo "   ✅ Works immediately"
echo "   ✅ Professional sender: 'SmartCart'"
echo ""





