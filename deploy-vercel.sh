#!/bin/bash

# Deploy SmartCart to Vercel for Clean URL

echo "🚀 Deploying SmartCart to Vercel"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."
echo "   This will give you: https://smartcart.vercel.app"
echo ""

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "   Your app will be available at the URL shown above"







