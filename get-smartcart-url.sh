#!/bin/bash

# Try to get a URL with "smartcart" in it using Cloudflare tunnels

echo "🔄 Trying to get a URL with 'smartcart' in it..."
echo "This may take a few attempts..."
echo ""

MAX_ATTEMPTS=5
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    
    # Kill any existing tunnel
    pkill -f "cloudflared.*5173" 2>/dev/null
    sleep 1
    
    # Start new tunnel and capture output
    TEMP_FILE=$(mktemp)
    timeout 8 cloudflared tunnel --url http://localhost:5173 > "$TEMP_FILE" 2>&1 &
    TUNNEL_PID=$!
    
    # Wait for tunnel to start
    sleep 6
    
    # Extract URL from output
    URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' "$TEMP_FILE" 2>/dev/null | head -1)
    
    if [ ! -z "$URL" ]; then
        echo "Got URL: $URL"
        
        # Check if URL contains "smartcart" (case insensitive)
        if echo "$URL" | grep -qi "smartcart"; then
            echo ""
            echo "✅ SUCCESS! Found URL with 'smartcart':"
            echo "$URL"
            echo ""
            echo "Keep this terminal open to keep the tunnel active."
            kill $TUNNEL_PID 2>/dev/null
            rm -f "$TEMP_FILE"
            # Start it properly in foreground
            cloudflared tunnel --url http://localhost:5173
            exit 0
        fi
        
        # Not what we want, kill it and try again
        kill $TUNNEL_PID 2>/dev/null
        rm -f "$TEMP_FILE"
    else
        echo "Could not extract URL, retrying..."
        kill $TUNNEL_PID 2>/dev/null
        rm -f "$TEMP_FILE"
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "⚠️  Could not get a URL with 'smartcart' after $MAX_ATTEMPTS attempts."
echo "   Starting a tunnel with a random URL instead..."
echo ""

# Start final tunnel
cloudflared tunnel --url http://localhost:5173
