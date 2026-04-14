#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# Deploy SmartCart to Vercel for Direct Link (No Warning Page)

echo "🚀 Deploying SmartCart to Vercel"
echo "=================================="
echo ""
echo "This will give you a direct link like: smartcart.vercel.app"
echo "No warning pages, works immediately!"
echo ""

# Check if already built
if [ ! -d "dist" ]; then
    echo "📦 Building frontend..."
    npm run build
fi

# Check if vercel is installed locally
if [ ! -f "node_modules/.bin/vercel" ]; then
    echo "📦 Installing Vercel CLI locally..."
    npm install vercel --save-dev
fi

echo ""
echo "🌐 Deploying to Vercel..."
echo "   (You may need to login if first time)"
echo ""

# Deploy to Vercel
npx vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Copy the Vercel URL shown above"
echo "   2. Update backend URL in Vercel dashboard:"
echo "      - Go to: https://vercel.com/dashboard"
echo "      - Select your project → Settings → Environment Variables"
echo "      - Add: VITE_API_URL=https://your-backend-tunnel-url"
echo "   3. Redeploy if needed"
echo ""
echo "🎉 Your direct link will be ready to share!"






