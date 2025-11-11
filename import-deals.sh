#!/bin/bash

# Script to import deals into SmartCart database
# Usage: ./import-deals.sh

set -e

echo "🚀 SmartCart Deals Import Script"
echo "================================"
echo ""

# Check if backend is running
echo "📡 Checking if backend is running..."
if ! curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "❌ Error: Backend is not running on port 8080"
    echo "   Please start the backend first:"
    echo "   cd backend && mvn spring-boot:run"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Get today's date in YYYYMMDD format
TODAY=$(date +%Y%m%d)
echo "📅 Today's date: $TODAY"
echo ""

# Update the date in the deals file if needed
DEALS_FILE="backend/src/main/resources/data/deals.comprehensive.json"
if [ -f "$DEALS_FILE" ]; then
    echo "📝 Updating date in deals file to today's date..."
    # Use sed to update the date (works on macOS and Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"date\": \"[0-9]\{8\}\"/\"date\": \"$TODAY\"/" "$DEALS_FILE"
    else
        # Linux
        sed -i "s/\"date\": \"[0-9]\{8\}\"/\"date\": \"$TODAY\"/" "$DEALS_FILE"
    fi
    echo "✅ Date updated to $TODAY"
else
    echo "❌ Error: Deals file not found at $DEALS_FILE"
    exit 1
fi
echo ""

# Import deals
echo "📦 Importing deals..."
echo ""

ADMIN_TOKEN="admin-secret-token-change-in-production"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/deals/admin/import \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d @"$DEALS_FILE")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Success! Deals imported successfully"
    echo ""
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "🎉 All done! You can now generate a shopping list and see the deals."
else
    echo "❌ Error importing deals (HTTP $HTTP_CODE)"
    echo ""
    echo "$BODY"
    exit 1
fi

echo ""
echo "🔍 Verifying deals were imported..."
DEALS_COUNT=$(curl -s http://localhost:8080/api/deals | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "unknown")
echo "   Found $DEALS_COUNT deals in database"
echo ""
echo "✨ Done! Your deals are now imported."









