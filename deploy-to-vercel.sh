#!/bin/bash

# Deploy SmartCart to Vercel

echo "🚀 Deploying SmartCart to Vercel"
echo "=================================="
echo ""

cd frontend

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Deploy using npx (no global install needed)
echo ""
echo "🌐 Deploying to Vercel..."
echo "   This will give you: smartcart-xxxxx.vercel.app"
echo ""

npx vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "   Your app is live at the URL shown above!"

