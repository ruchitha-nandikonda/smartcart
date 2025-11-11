#!/bin/bash

# Quick setup: Just paste your ngrok authtoken when prompted

echo "🎯 SmartCart ngrok Setup"
echo "========================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo "Install with: brew install ngrok"
    exit 1
fi

# Get authtoken from user
echo "📋 Please enter your ngrok authtoken:"
echo "   (Get it from: https://dashboard.ngrok.com/get-started/your-authtoken)"
echo ""
read -p "Authtoken: " AUTHTOKEN

if [ -z "$AUTHTOKEN" ]; then
    echo "❌ No authtoken provided"
    exit 1
fi

echo ""
echo "🔧 Configuring ngrok..."
ngrok config add-authtoken "$AUTHTOKEN"

if [ $? -eq 0 ]; then
    echo "✅ ngrok configured successfully!"
    echo ""
    
    # Ensure frontend is running
    if ! lsof -ti:5173 > /dev/null 2>&1; then
        echo "Starting frontend..."
        cd frontend
        npm run dev > /tmp/frontend.log 2>&1 &
        sleep 3
    fi
    
    # Stop old tunnels
    echo "🛑 Stopping old tunnels..."
    pkill -f "ngrok" 2>/dev/null
    pkill -f "cloudflared.*5173" 2>/dev/null
    pkill -f "ssh.*localhost.run" 2>/dev/null
    sleep 2
    
    echo ""
    echo "🌐 Starting SmartCart..."
    echo "   URL: https://smartcart.ngrok-free.app"
    echo ""
    echo "📋 Keep this terminal open!"
    echo ""
    
    ngrok http 5173 --domain=smartcart.ngrok-free.app
else
    echo "❌ Failed to configure ngrok"
    exit 1
fi







