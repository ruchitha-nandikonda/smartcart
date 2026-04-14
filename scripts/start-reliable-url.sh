#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# SmartCart - Reliable URL Setup

echo "🎯 SmartCart URL Setup"
echo "======================"
echo ""

# Ensure frontend is running
if ! lsof -ti:5173 > /dev/null 2>&1; then
    echo "Starting frontend..."
    cd frontend
    npm run dev > /tmp/frontend.log 2>&1 &
    sleep 3
fi

# Stop old tunnels
pkill -f "cloudflared.*5173" 2>/dev/null
sleep 2

echo "🌐 Starting Cloudflare tunnel (most reliable)..."
echo ""

# Start Cloudflare tunnel and capture URL
cloudflared tunnel --url http://localhost:5173 2>&1 | while IFS= read -r line; do
    echo "$line"
    if echo "$line" | grep -q "https://.*trycloudflare"; then
        URL=$(echo "$line" | grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" | head -1)
        if [ ! -z "$URL" ]; then
            echo ""
            echo "✅ Your SmartCart URL:"
            echo "   $URL"
            echo ""
            echo "📋 Share this URL with others!"
            echo ""
        fi
    fi
done









