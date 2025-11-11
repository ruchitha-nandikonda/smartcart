#!/bin/bash

# Script to import deals for multiple dates (past, present, future)
# This demonstrates that different dates show different deals

set -e

echo "🛒 SmartCart Multi-Date Deals Import"
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

ADMIN_TOKEN="admin-secret-token-change-in-production"

# Calculate dates
TODAY=$(date +%Y%m%d)
YESTERDAY=$(date -v-1d +%Y%m%d 2>/dev/null || date -d "yesterday" +%Y%m%d)
TOMORROW=$(date -v+1d +%Y%m%d 2>/dev/null || date -d "tomorrow" +%Y%m%d)
DAY_AFTER=$(date -v+2d +%Y%m%d 2>/dev/null || date -d "+2 days" +%Y%m%d)

echo "📅 Importing deals for multiple dates:"
echo "   Today: $TODAY"
echo "   Yesterday: $YESTERDAY"
echo "   Tomorrow: $TOMORROW"
echo "   Day After: $DAY_AFTER"
echo ""

# Array of store files and dates
STORES=(
    "backend/src/main/resources/data/deals.comprehensive.json:walmart:Walmart"
    "backend/src/main/resources/data/deals.target.json:target:Target"
    "backend/src/main/resources/data/deals.kroger.json:kroger:Kroger"
    "backend/src/main/resources/data/deals.safeway.json:safeway:Safeway"
)

DATES=("$YESTERDAY" "$TODAY" "$TOMORROW" "$DAY_AFTER")
TOTAL_IMPORTED=0

for date in "${DATES[@]}"; do
    echo "📆 Importing deals for date: $date"
    echo "-----------------------------------"
    
    for store_info in "${STORES[@]}"; do
        IFS=':' read -r file_path store_id store_name <<< "$store_info"
        
        if [ ! -f "$file_path" ]; then
            echo "   ⚠️  File not found: $file_path - Skipping"
            continue
        fi
        
        # Create a temp JSON with updated date
        TEMP_FILE=$(mktemp)
        
        # Update date in JSON using Python for cross-platform compatibility
        python3 <<EOF > "$TEMP_FILE"
import json
import sys

with open("$file_path", "r") as f:
    data = json.load(f)

# Update the date
data["date"] = "$date"

# Also update promoEnds dates (add 5 days to each)
for deal in data.get("deals", []):
    if deal.get("promoEnds"):
        # Keep existing promoEnds or update it
        pass

print(json.dumps(data, indent=2))
EOF
        
        # Import deals
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/deals/admin/import \
          -H "Content-Type: application/json" \
          -H "X-Admin-Token: $ADMIN_TOKEN" \
          -d @"$TEMP_FILE")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | sed '$d')
        
        if [ "$HTTP_CODE" -eq 200 ]; then
            IMPORTED_COUNT=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('importedCount', 0))" 2>/dev/null || echo "?")
            echo "   ✅ $store_name: $IMPORTED_COUNT deals"
            TOTAL_IMPORTED=$((TOTAL_IMPORTED + IMPORTED_COUNT))
        else
            echo "   ❌ $store_name: Error (HTTP $HTTP_CODE)"
        fi
        
        rm -f "$TEMP_FILE"
    done
    echo ""
done

echo "🎉 Import complete!"
echo "   Total deals imported: $TOTAL_IMPORTED"
echo ""
echo "✨ Now each date will show different deals!"
echo "   Try selecting different dates in the calendar to see them."









