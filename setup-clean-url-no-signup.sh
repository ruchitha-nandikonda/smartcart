#!/bin/bash

# Setup SmartCart with Clean URL (No Signup Required)

echo "🎯 Setting Up SmartCart with Clean URL"
echo "======================================="
echo ""

# Stop existing tunnels
pkill -f "cloudflared.*5173" 2>/dev/null
pkill -f "ssh.*localhost.run" 2>/dev/null

echo "🌐 Starting tunnel with localhost.run..."
echo "   This gives you a clean URL like: smartcart-xxxxx.localhost.run"
echo "   No signup required!"
echo ""

# Use localhost.run (no signup, clean URLs)
# It will give you a URL like: smartcart-xxxxx.localhost.run
ssh -R 80:localhost:5173 nokey@localhost.run







