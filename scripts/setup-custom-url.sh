#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# Setup Custom Meaningful URL for SmartCart

echo "🎯 Setting Up Custom URL for SmartCart"
echo "========================================"
echo ""

# Check ngrok auth
if ngrok config check > /dev/null 2>&1; then
    echo "✅ ngrok is authenticated!"
    echo ""
    echo "What custom name would you like?"
    echo "Examples: smartcart, my-smartcart, smartcart-app"
    echo ""
    read -p "Enter your custom subdomain name: " CUSTOM_NAME
    
    if [ ! -z "$CUSTOM_NAME" ]; then
        echo ""
        echo "🌐 Starting ngrok with custom subdomain: $CUSTOM_NAME"
        echo ""
        echo "This will create: https://$CUSTOM_NAME.ngrok-free.app"
        echo ""
        ngrok http 5173 --domain=$CUSTOM_NAME.ngrok-free.app
    else
        echo "No name provided. Using default..."
        ngrok http 5173
    fi
else
    echo "⚠️  ngrok needs authentication for custom domains"
    echo ""
    echo "📋 Quick Setup (2 minutes):"
    echo "  1. Sign up (free): https://dashboard.ngrok.com/signup"
    echo "  2. Get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "  3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo "  4. Then run this script again!"
    echo ""
    echo "Or use Cloudflare with a simpler approach..."
fi









