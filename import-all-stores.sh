#!/bin/bash

# Script to import deals for all stores (Walmart, Target, Kroger, Safeway)
# Usage: ./import-all-stores.sh

set -e

echo "🛒 SmartCart Multi-Store Deals Import"
echo "======================================"
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

# Get today's date
TODAY=$(date +%Y%m%d)
echo "📅 Today's date: $TODAY"
echo ""

ADMIN_TOKEN="admin-secret-token-change-in-production"

# Array of stores to import
STORES=(
    "backend/src/main/resources/data/deals.comprehensive.json:walmart:Walmart"
    "backend/src/main/resources/data/deals.target.json:target:Target"
    "backend/src/main/resources/data/deals.kroger.json:kroger:Kroger"
    "backend/src/main/resources/data/deals.safeway.json:safeway:Safeway"
)

TOTAL_IMPORTED=0

for store_info in "${STORES[@]}"; do
    IFS=':' read -r file_path store_id store_name <<< "$store_info"
    
    echo "📦 Importing deals for $store_name..."
    
    if [ ! -f "$file_path" ]; then
        echo "   ⚠️  File not found: $file_path - Skipping"
        echo ""
        continue
    fi
    
    # Update date in file if needed (for comprehensive.json)
    if [[ "$file_path" == *"comprehensive.json" ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/\"date\": \"[0-9]\{8\}\"/\"date\": \"$TODAY\"/" "$file_path"
        else
            sed -i "s/\"date\": \"[0-9]\{8\}\"/\"date\": \"$TODAY\"/" "$file_path"
        fi
    else
        # Update date for other files
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/\"date\": \"[0-9]\{8\}\"/\"date\": \"$TODAY\"/" "$file_path"
        else
            sed -i "s/\"date\": \"[0-9]\{8\}\"/\"date\": \"$TODAY\"/" "$file_path"
        fi
    fi
    
    # Import deals
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/deals/admin/import \
      -H "Content-Type: application/json" \
      -H "X-Admin-Token: $ADMIN_TOKEN" \
      -d @"$file_path")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        IMPORTED_COUNT=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('importedCount', 0))" 2>/dev/null || echo "?")
        echo "   ✅ Successfully imported $IMPORTED_COUNT deals"
        TOTAL_IMPORTED=$((TOTAL_IMPORTED + IMPORTED_COUNT))
    else
        echo "   ❌ Error importing (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
    fi
    echo ""
done

echo "🎉 Import complete!"
echo "   Total deals imported: $TOTAL_IMPORTED"
echo ""

# Verify stores
echo "🔍 Verifying stores..."
STORES_LIST=$(curl -s "http://localhost:8080/api/deals" | python3 -c "import sys, json; deals = json.load(sys.stdin); stores = sorted(set(d.get('storeName') for d in deals)); print(', '.join(stores))" 2>/dev/null || echo "unknown")
echo "   Available stores: $STORES_LIST"
echo ""
echo "✨ All done! Refresh your Deals page to see the new stores."

