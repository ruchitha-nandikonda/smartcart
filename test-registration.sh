#!/bin/bash

# Test Registration and OTP Email Sending
# This script tests if the registration endpoint is working

echo "🧪 Testing SmartCart Registration & OTP Email"
echo "=============================================="
echo ""

# Load environment variables
if [ -f "backend/.env" ]; then
    source backend/.env
    echo "✅ Configuration loaded"
else
    echo "❌ backend/.env not found"
    exit 1
fi

echo ""
echo "📋 Configuration:"
echo "   Email: $AWS_SES_FROM_EMAIL"
echo "   Region: $AWS_REGION"
echo "   SES Enabled: $AWS_SES_ENABLED"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend is not running"
    echo ""
    echo "Please start the backend first:"
    echo "   cd backend && mvn spring-boot:run"
    exit 1
fi

echo ""
echo "📧 Testing registration for: $AWS_SES_FROM_EMAIL"
echo ""

# Test registration
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$AWS_SES_FROM_EMAIL\",\"password\":\"TestPassword123!\"}" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

echo "📤 Registration Request Sent"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Registration successful! (HTTP 200)"
    echo ""
    
    # Check if OTP is in response (development mode)
    if echo "$BODY" | grep -q "otpCode"; then
        OTP_CODE=$(echo "$BODY" | grep -o '"otpCode":"[^"]*"' | cut -d'"' -f4)
        echo "🔑 OTP Code (Development Mode): $OTP_CODE"
        echo ""
    fi
    
    echo "📧 Email Status:"
    echo "   ✅ Registration endpoint responded successfully"
    echo "   📬 OTP email should be sent to: $AWS_SES_FROM_EMAIL"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Check your Gmail inbox: $AWS_SES_FROM_EMAIL"
    echo "   2. Look for email with subject: 'Your SmartCart Verification Code'"
    echo "   3. Check spam/junk folder if not in inbox"
    echo "   4. The email should contain a 6-digit OTP code"
    echo ""
    echo "⏰ Email should arrive within a few seconds"
    
elif [ "$HTTP_STATUS" = "400" ] || [ "$HTTP_STATUS" = "500" ]; then
    echo "❌ Registration failed (HTTP $HTTP_STATUS)"
    echo ""
    echo "Response:"
    echo "$BODY" | head -5
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   - Check backend logs for errors"
    echo "   - Verify email is verified in AWS SES"
    echo "   - Check AWS credentials are correct"
else
    echo "⚠️  Unexpected response (HTTP $HTTP_STATUS)"
    echo ""
    echo "Response:"
    echo "$BODY"
fi

echo ""





