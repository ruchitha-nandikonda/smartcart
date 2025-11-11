#!/bin/bash

# Setup SmartCart with Custom URL: smartcart

echo "🎯 Setting Up SmartCart Custom URL"
echo "==================================="
echo ""

CUSTOM_NAME="smartcart"

# Check if ngrok is authenticated
if ngrok config check > /dev/null 2>&1; then
    echo "✅ ngrok is authenticated!"
    echo ""
    echo "🌐 Starting SmartCart with custom URL..."
    echo "   URL will be: https://$CUSTOM_NAME.ngrok-free.app"
    echo ""
    
    # Stop existing Cloudflare tunnels
    pkill -f "cloudflared.*5173" 2>/dev/null
    
    # Start ngrok with custom domain
    ngrok http 5173 --domain=$CUSTOM_NAME.ngrok-free.app
    
else
    echo "⚠️  ngrok needs authentication for custom domains"
    echo ""
    echo "📋 Quick Setup Steps:"
    echo ""
    echo "1. Sign up (free, 30 seconds):"
    echo "   https://dashboard.ngrok.com/signup"
    echo ""
    echo "2. Get your authtoken:"
    echo "   https://dashboard.ngrok.com/get-started/your-authtoken"
    echo ""
    echo "3. Once you have the token, run:"
    echo "   ngrok config add-authtoken YOUR_TOKEN_HERE"
    echo ""
    echo "4. Then run this script again:"
    echo "   ./setup-smartcart-url.sh"
    echo ""
    echo "After setup, your URL will be:"
    echo "   https://$CUSTOM_NAME.ngrok-free.app"
    echo ""
fi







