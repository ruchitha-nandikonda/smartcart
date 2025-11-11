#!/bin/bash

# Test script for scheduled deal import
# Usage: ./test-scheduled-import.sh

echo "🧪 Testing Scheduled Deal Import"
echo "================================"
echo ""

# Check if backend is running
echo "📡 Checking backend status..."
if ! curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "❌ Backend is not running on port 8080"
    echo "   Please start the backend first:"
    echo "   cd backend && mvn spring-boot:run"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Test manual trigger
echo "🚀 Triggering scheduled import manually..."
echo ""

ADMIN_TOKEN="admin-secret-token-change-in-production"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/deals/admin/trigger-import \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: $ADMIN_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Success! Import triggered"
    echo ""
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    
    # Wait a moment for import to complete
    echo "⏳ Waiting for import to complete..."
    sleep 3
    
    # Check deals
    echo ""
    echo "🔍 Verifying deals were imported..."
    DEALS_COUNT=$(curl -s "http://localhost:8080/api/deals?storeId=walmart" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    TODAY=$(date +%Y%m%d)
    
    echo "   Found $DEALS_COUNT deals in database"
    echo "   Today's date: $TODAY"
    echo ""
    
    if [ "$DEALS_COUNT" -gt 0 ]; then
        echo "✅ Scheduled import is working correctly!"
    else
        echo "⚠️  No deals found - check backend logs for errors"
    fi
else
    echo "❌ Error triggering import (HTTP $HTTP_CODE)"
    echo ""
    echo "$BODY"
    exit 1
fi

echo ""
echo "✨ Test complete!"









