#!/bin/bash

# Resolve repository root (this script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# SmartCart Complete Setup with Cloudflare URLs

export VITE_API_URL=https://bra-ensures-yrs-subsection.trycloudflare.com

echo "🚀 SmartCart Sharing Setup Complete!"
echo "===================================="
echo ""
echo "✅ Backend URL: https://bra-ensures-yrs-subsection.trycloudflare.com"
echo "✅ Frontend URL: https://there-outside-restricted-excerpt.trycloudflare.com"
echo ""
echo "📋 To complete setup:"
echo ""
echo "1. Stop your current frontend (press Ctrl+C in the frontend terminal)"
echo ""
echo "2. Run these commands:"
echo "   export VITE_API_URL=https://bra-ensures-yrs-subsection.trycloudflare.com"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Share this URL with others:"
echo "   https://there-outside-restricted-excerpt.trycloudflare.com"
echo ""
echo "🎉 That's it! The app is now shareable!"









