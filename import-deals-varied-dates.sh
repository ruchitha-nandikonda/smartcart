#!/bin/bash

# Script to import deals with DIFFERENT products for each date
# Each date will have a unique mix of products rotated/selected from the master lists

set -e

echo "🛒 SmartCart Varied Deals Import - Different Products Each Day"
echo "=============================================================="
echo ""

# Check if backend is running
echo "📡 Checking if backend is running..."
if ! curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "❌ Error: Backend is not running on port 8080"
    echo "   Please start the backend first"
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

echo "📅 Importing VARIED deals for:"
echo "   Date 1 ($YESTERDAY): Focus on Meat & Produce"
echo "   Date 2 ($TODAY): Focus on Dairy & Bakery"
echo "   Date 3 ($TOMORROW): Focus on Pantry & Beverages"
echo "   Date 4 ($DAY_AFTER): Focus on Frozen & Specialty"
echo ""

# Use standalone Python script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Array of stores
STORES=(
    "backend/src/main/resources/data/deals.comprehensive.json:walmart:Walmart"
    "backend/src/main/resources/data/deals.target.json:target:Target"
    "backend/src/main/resources/data/deals.kroger.json:kroger:Kroger"
    "backend/src/main/resources/data/deals.safeway.json:safeway:Safeway"
)

DATES=("$YESTERDAY" "$TODAY" "$TOMORROW" "$DAY_AFTER")
TOTAL_IMPORTED=0

for date_idx in "${!DATES[@]}"; do
    date="${DATES[$date_idx]}"
    echo "📆 Importing VARIED deals for date: $date (Rotation #$((date_idx + 1)))"
    echo "-----------------------------------"
    
    for store_info in "${STORES[@]}"; do
        IFS=':' read -r file_path store_id store_name <<< "$store_info"
        
        if [ ! -f "$file_path" ]; then
            echo "   ⚠️  File not found: $file_path - Skipping"
            continue
        fi
        
        # Create UNIQUE product deals using Python script
        TEMP_FILE=$(mktemp)
        python3 "$SCRIPT_DIR/vary_deals_unique.py" "$file_path" "$date" "$date_idx" "$TEMP_FILE"
        
        # Import deals
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/deals/admin/import \
          -H "Content-Type: application/json" \
          -H "X-Admin-Token: $ADMIN_TOKEN" \
          -d @"$TEMP_FILE")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | sed '$d')
        
        if [ "$HTTP_CODE" -eq 200 ]; then
            IMPORTED_COUNT=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('importedCount', 0))" 2>/dev/null || echo "?")
            PRODUCT_COUNT=$(python3 -c "import json; print(len(json.load(open('$TEMP_FILE'))['deals']))" 2>/dev/null || echo "?")
            echo "   ✅ $store_name: $IMPORTED_COUNT deals (unique product mix)"
            TOTAL_IMPORTED=$((TOTAL_IMPORTED + IMPORTED_COUNT))
        else
            echo "   ❌ $store_name: Error (HTTP $HTTP_CODE)"
        fi
        
        rm -f "$TEMP_FILE"
    done
    echo ""
done

rm -f /tmp/vary_deals.py

echo "🎉 Import complete!"
echo "   Total deals imported: $TOTAL_IMPORTED"
echo ""
echo "✨ Each date now has DIFFERENT products and pricing!"
echo "   • $YESTERDAY: Meat & Produce focus (70% of products, weekend pricing)"
echo "   • $TODAY: Dairy & Bakery focus (70% of products, regular pricing)"
echo "   • $TOMORROW: Pantry & Beverages focus (70% with wrap-around, discount pricing)"
echo "   • $DAY_AFTER: Specialty focus (50% selection, premium pricing)"
echo ""
echo "   Try selecting different dates in the calendar to see varied deals!"

