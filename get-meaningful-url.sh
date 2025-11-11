#!/bin/bash

# SmartCart - Get Meaningful URL (Multiple Services)

echo "🎯 SmartCart URL Setup - Trying Multiple Services"
echo "=================================================="
echo ""

# Ensure frontend is running
if ! lsof -ti:5173 > /dev/null 2>&1; then
    echo "Starting frontend..."
    cd frontend
    npm run dev > /tmp/frontend.log 2>&1 &
    sleep 3
fi

echo "Trying services in order:"
echo "1. localhost.run (usually works)"
echo "2. Cloudflare (always works, random name)"
echo ""

# Try localhost.run first
echo "🌐 Trying localhost.run..."
echo "   This gives: smartcart-xxxxx.localhost.run"
echo ""

ssh -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@localhost.run 2>&1 &
SSH_PID=$!
sleep 8

if ps -p $SSH_PID > /dev/null 2>&1; then
    echo ""
    echo "✅ localhost.run connected!"
    echo "   Check the output above for your URL"
    wait $SSH_PID
else
    echo "❌ localhost.run didn't work, using Cloudflare..."
    echo ""
    cloudflared tunnel --url http://localhost:5173
fi







