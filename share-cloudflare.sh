#!/bin/bash

# SmartCart Share using Cloudflare Tunnel (No signup required!)

echo "🚀 SmartCart Sharing with Cloudflare Tunnel"
echo "============================================"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed!"
    echo "Installing..."
    brew install cloudflared
fi

# Check services
echo "📋 Checking services..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend running"
else
    echo "❌ Backend not running!"
    exit 1
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend running"
else
    echo "❌ Frontend not running!"
    exit 1
fi

echo ""
echo "🌐 Starting Cloudflare Tunnels..."
echo ""
echo "This will open TWO terminal windows:"
echo "  1. Backend tunnel (port 8080)"
echo "  2. Frontend tunnel (port 5173)"
echo ""

# Start backend tunnel
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && echo \"Backend Tunnel (port 8080):\" && cloudflared tunnel --url http://localhost:8080"' 2>/dev/null || {
    echo "⚠️  Could not open terminal. Run manually:"
    echo "   Terminal 1: cloudflared tunnel --url http://localhost:8080"
    echo "   Terminal 2: cloudflared tunnel --url http://localhost:5173"
    exit 0
}

sleep 2

# Start frontend tunnel
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && echo \"Frontend Tunnel (port 5173):\" && cloudflared tunnel --url http://localhost:5173"' 2>/dev/null || {
    echo "⚠️  Could not open second terminal. Run manually: cloudflared tunnel --url http://localhost:5173"
}

echo ""
echo "✅ Tunnels started!"
echo ""
echo "📋 Next steps:"
echo "  1. Copy the BACKEND URL from Terminal 1 (starts with https://)"
echo "  2. In your frontend terminal, run:"
echo "     export VITE_API_URL=<backend-url>"
echo "     cd frontend && npm run dev"
echo "  3. Copy the FRONTEND URL from Terminal 2"
echo "  4. Share the frontend URL! 🎉"
echo ""
echo "💡 URLs will be shown in the terminal windows"







