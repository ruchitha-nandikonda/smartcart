#!/bin/bash

# SmartCart Complete Setup Script
# This will get URLs and configure everything

echo "🔧 SmartCart Complete Setup"
echo "==========================="
echo ""

# Wait for ngrok to be ready
echo "⏳ Waiting for ngrok tunnels to be ready..."
sleep 10

# Try to get URLs from ngrok API
BACKEND_URL=""
FRONTEND_URL=""

# Try multiple times
for i in {1..5}; do
    TUNNELS_JSON=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null)
    
    if [ ! -z "$TUNNELS_JSON" ] && echo "$TUNNELS_JSON" | grep -q "public_url"; then
        BACKEND_URL=$(echo "$TUNNELS_JSON" | python3 -c "import sys,json;d=json.load(sys.stdin);t=[t for t in d.get('tunnels',[]) if '8080' in str(t.get('config',{}).get('addr',''))];print(t[0]['public_url'] if t else '')" 2>/dev/null)
        FRONTEND_URL=$(echo "$TUNNELS_JSON" | python3 -c "import sys,json;d=json.load(sys.stdin);t=[t for t in d.get('tunnels',[]) if '5173' in str(t.get('config',{}).get('addr',''))];print(t[0]['public_url'] if t else '')" 2>/dev/null)
        
        if [ ! -z "$BACKEND_URL" ] || [ ! -z "$FRONTEND_URL" ]; then
            break
        fi
    fi
    sleep 2
done

echo ""
echo "📋 Setup Instructions:"
echo "======================"
echo ""

if [ ! -z "$BACKEND_URL" ]; then
    echo "✅ Backend URL: $BACKEND_URL"
    echo ""
    echo "📝 To configure frontend, run these commands:"
    echo "   export VITE_API_URL=$BACKEND_URL"
    echo "   cd frontend"
    echo "   npm run dev"
    echo ""
    
    # Create setup file
    cat > /tmp/smartcart-restart-frontend.sh << EOF
#!/bin/bash
export VITE_API_URL=$BACKEND_URL
cd $(pwd)/frontend
npm run dev
EOF
    chmod +x /tmp/smartcart-restart-frontend.sh
    echo "✅ Created script: /tmp/smartcart-restart-frontend.sh"
    echo "   Run: source /tmp/smartcart-restart-frontend.sh"
else
    echo "⚠️  Backend URL not found automatically"
    echo "   Please check Terminal 1 or visit: http://127.0.0.1:4040"
    echo "   Look for the tunnel with 'localhost:8080'"
    echo "   Copy the 'Forwarding' URL"
fi

echo ""

if [ ! -z "$FRONTEND_URL" ]; then
    echo "✅ Frontend URL: $FRONTEND_URL"
    echo ""
    echo "📤 SHARE THIS URL WITH OTHERS:"
    echo "   $FRONTEND_URL"
else
    echo "⚠️  Frontend URL not found automatically"
    echo "   Please check Terminal 2 or visit: http://127.0.0.1:4040"
    echo "   Look for the tunnel with 'localhost:5173'"
    echo "   Copy the 'Forwarding' URL to share"
fi

echo ""
echo "💡 Tip: Visit http://127.0.0.1:4040 to see all tunnels"
echo ""







