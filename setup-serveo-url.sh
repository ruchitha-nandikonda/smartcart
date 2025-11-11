#!/bin/bash

# Setup SmartCart with Clean URL using serveo.net (No Signup)

echo "🎯 Setting Up SmartCart with Clean URL"
echo "======================================="
echo ""

# Stop existing tunnels
pkill -f "cloudflared.*5173" 2>/dev/null
pkill -f "ssh.*serveo" 2>/dev/null

echo "🌐 Starting tunnel with serveo.net..."
echo "   This gives you: smartcart.serveo.net"
echo "   No signup required!"
echo ""

# Use serveo.net with custom subdomain
ssh -R smartcart:80:localhost:5173 serveo.net







