#!/bin/bash

# Setup SmartCart with ngrok - smartcart.ngrok-free.app

echo "🎯 Setting Up SmartCart with ngrok"
echo "==================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Install it with:"
    echo "  brew install ngrok"
    exit 1
fi

# Check if authenticated
if ngrok config check > /dev/null 2>&1; then
    echo "✅ ngrok is authenticated!"
    echo ""
    
    # Ensure frontend is running
    if ! lsof -ti:5173 > /dev/null 2>&1; then
        echo "Starting frontend..."
        cd frontend
        npm run dev > /tmp/frontend.log 2>&1 &
        sleep 3
        echo "✅ Frontend started!"
        echo ""
    fi
    
    # Stop old tunnels
    echo "🛑 Stopping old tunnels..."
    pkill -f "ngrok" 2>/dev/null
    pkill -f "cloudflared.*5173" 2>/dev/null
    pkill -f "ssh.*localhost.run" 2>/dev/null
    sleep 2
    
    echo ""
    echo "🌐 Starting SmartCart with custom URL..."
    echo "   URL: https://smartcart.ngrok-free.app"
    echo ""
    echo "📋 Keep this terminal open to maintain the connection!"
    echo ""
    
    # Start ngrok with custom domain
    ngrok http 5173 --domain=smartcart.ngrok-free.app
    
else
    echo "⚠️  ngrok needs authentication"
    echo ""
    echo "📋 Quick Setup (2 minutes):"
    echo ""
    echo "1. Sign up (free): https://dashboard.ngrok.com/signup"
    echo ""
    echo "2. Get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo ""
    echo "3. Once you have your authtoken, run:"
    echo "   ngrok config add-authtoken YOUR_TOKEN_HERE"
    echo ""
    echo "4. Then run this script again:"
    echo "   ./setup-ngrok-smartcart.sh"
    echo ""
    echo "After setup, you'll get: https://smartcart.ngrok-free.app"
    echo ""
fi







