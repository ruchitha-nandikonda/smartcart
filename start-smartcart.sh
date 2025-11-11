#!/bin/bash

# SmartCart Clean URL - Complete Setup Script

echo "🎯 SmartCart Clean URL Setup"
echo "============================"
echo ""

# Check if frontend is running
if ! lsof -ti:5173 > /dev/null 2>&1; then
    echo "⚠️  Frontend not running. Starting it..."
    cd frontend
    npm run dev > /tmp/frontend.log 2>&1 &
    sleep 3
    echo "✅ Frontend started!"
    echo ""
fi

# Stop old tunnels
echo "🛑 Stopping old tunnels..."
pkill -f "ssh.*serveo" 2>/dev/null
pkill -f "cloudflared.*5173" 2>/dev/null
sleep 2

echo ""
echo "🌐 Starting SmartCart tunnel with serveo.net..."
echo ""
echo "📋 Your URL will be: https://smartcart.serveo.net"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Keep this terminal window open"
echo "   - The URL will appear below"
echo "   - If 'smartcart' is taken, try: mysmartcart, smartcart-app, etc."
echo ""

# Start tunnel (interactive so user can see the URL)
ssh -o StrictHostKeyChecking=no -R smartcart:80:localhost:5173 serveo.net







