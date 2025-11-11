#!/bin/bash

# Complete Setup: SmartCart with Clean URL (No Signup)

echo "🎯 SmartCart Clean URL Setup"
echo "============================"
echo ""

# Stop existing frontend tunnels
echo "🛑 Stopping existing tunnels..."
pkill -f "cloudflared.*5173" 2>/dev/null
pkill -f "ssh.*serveo" 2>/dev/null
pkill -f "ssh.*localhost.run" 2>/dev/null
sleep 2

echo ""
echo "🌐 Starting SmartCart frontend tunnel..."
echo "   URL will be: https://smartcart.serveo.net"
echo ""
echo "📋 Instructions:"
echo "   1. Keep this terminal open"
echo "   2. Copy the URL shown above"
echo "   3. Share it with others!"
echo ""
echo "⚠️  Note: If 'smartcart' is taken, try:"
echo "   ssh -R mysmartcart:80:localhost:5173 serveo.net"
echo ""

# Start serveo tunnel
ssh -R smartcart:80:localhost:5173 serveo.net







