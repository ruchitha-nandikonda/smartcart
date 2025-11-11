#!/bin/bash

# Extract Cloudflare Tunnel URLs and complete setup

echo "🔍 Extracting Tunnel URLs..."
echo "============================"
echo ""

sleep 5

# Try to find URLs in process output or logs
echo "📋 Instructions:"
echo ""
echo "Look at the TWO terminal windows that opened."
echo "Each Cloudflare tunnel shows a URL like:"
echo "  https://xxxxx-xxxx.trycloudflare.com"
echo ""
echo "Terminal 1 (Backend - port 8080):"
echo "  Copy the URL that starts with https://"
echo ""
echo "Terminal 2 (Frontend - port 5173):"
echo "  Copy the URL that starts with https://"
echo ""
echo "Then run these commands:"
echo ""
echo "1. Set backend URL (replace with Terminal 1 URL):"
echo "   export VITE_API_URL=https://xxxxx.trycloudflare.com"
echo ""
echo "2. Restart frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Share Terminal 2 URL with others!"
echo ""
echo "💡 The URLs are displayed in the terminal windows"
echo "   They look like: https://abc-def-123.trycloudflare.com"







