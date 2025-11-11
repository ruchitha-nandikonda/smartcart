#!/bin/bash

# Simple SmartCart Share Script
echo "🚀 SmartCart Sharing Setup"
echo "=========================="
echo ""

# Check services
echo "📋 Checking services..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend running"
else
    echo "❌ Backend not running - start it first!"
    exit 1
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend running"
else
    echo "❌ Frontend not running - start it first!"
    exit 1
fi

echo ""
echo "🌐 Starting ngrok tunnels..."
echo ""
echo "This will open TWO terminal windows:"
echo "  1. Backend tunnel (port 8080)"
echo "  2. Frontend tunnel (port 5173)"
echo ""

# Start backend tunnel in new terminal
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && echo \"Backend Tunnel (port 8080):\" && ngrok http 8080"' 2>/dev/null || {
    echo "⚠️  Could not open new terminal. Please run manually:"
    echo ""
    echo "Terminal 1: ngrok http 8080"
    echo "Terminal 2: ngrok http 5173"
    echo ""
    echo "Then:"
    echo "  1. Copy backend URL from Terminal 1"
    echo "  2. Run: export VITE_API_URL=<backend-url>"
    echo "  3. Restart frontend: cd frontend && npm run dev"
    echo "  4. Copy frontend URL from Terminal 2 and share it!"
    exit 0
}

sleep 2

# Start frontend tunnel in new terminal  
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && echo \"Frontend Tunnel (port 5173):\" && ngrok http 5173"' 2>/dev/null || {
    echo "⚠️  Could not open second terminal. Run manually: ngrok http 5173"
}

echo ""
echo "✅ Tunnels started in new terminals!"
echo ""
echo "📋 Next steps:"
echo "  1. Copy the BACKEND URL from Terminal 1 (starts with https://)"
echo "  2. In your frontend terminal, run:"
echo "     export VITE_API_URL=<backend-url>"
echo "     cd frontend && npm run dev"
echo "  3. Copy the FRONTEND URL from Terminal 2"
echo "  4. Share the frontend URL with others! 🎉"
echo ""
echo "💡 Tip: Check ngrok web UI at http://127.0.0.1:4040"
