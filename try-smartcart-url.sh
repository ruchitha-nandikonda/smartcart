#!/bin/bash

# Try multiple smartcart subdomain variations on serveo.net

echo "🎯 Trying to get 'smartcart' URL on serveo.net"
echo "=============================================="
echo ""

# Ensure frontend is running
if ! lsof -ti:5173 > /dev/null 2>&1; then
    echo "Starting frontend..."
    cd frontend
    npm run dev > /tmp/frontend.log 2>&1 &
    sleep 3
fi

SUBDOMAINS=("smartcart" "mysmartcart" "smartcartapp" "smartcart-demo" "smartcart-app" "smartcartdev")

echo "Trying subdomains: ${SUBDOMAINS[*]}"
echo ""
echo "This will try each subdomain until one works..."
echo ""

for subdomain in "${SUBDOMAINS[@]}"; do
    echo "Trying: $subdomain.serveo.net..."
    
    # Try to connect with timeout
    timeout 10 ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 \
        -R ${subdomain}:80:localhost:5173 serveo.net 2>&1 &
    
    SSH_PID=$!
    sleep 5
    
    # Check if SSH is still running (means it connected)
    if ps -p $SSH_PID > /dev/null 2>&1; then
        echo ""
        echo "✅ SUCCESS! Connected to: https://${subdomain}.serveo.net"
        echo ""
        echo "Keep this terminal open to maintain the connection!"
        echo ""
        wait $SSH_PID
        exit 0
    else
        echo "❌ $subdomain not available, trying next..."
        pkill -f "ssh.*serveo" 2>/dev/null
        sleep 2
    fi
done

echo ""
echo "⚠️  None of the subdomains worked. Using Cloudflare instead..."
echo "Starting Cloudflare tunnel..."
cloudflared tunnel --url http://localhost:5173







