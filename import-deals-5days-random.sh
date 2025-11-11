#!/bin/bash

# Script to import deals for next 5 days with RANDOM products and DIFFERENT discounts each day
# Each day gets completely different random products with unique discount percentages

set -e

echo "🛒 SmartCart 5-Day Random Deals Import"
echo "======================================"
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

# Calculate dates: Today + next 4 days (5 days total)
TODAY=$(date +%Y%m%d)
DAY1=$(date -v+1d +%Y%m%d 2>/dev/null || date -d "+1 day" +%Y%m%d)
DAY2=$(date -v+2d +%Y%m%d 2>/dev/null || date -d "+2 days" +%Y%m%d)
DAY3=$(date -v+3d +%Y%m%d 2>/dev/null || date -d "+3 days" +%Y%m%d)
DAY4=$(date -v+4d +%Y%m%d 2>/dev/null || date -d "+4 days" +%Y%m%d)

echo "📅 Generating deals for 5 days:"
echo "   Day 1 ($TODAY): Today"
echo "   Day 2 ($DAY1): Tomorrow"
echo "   Day 3 ($DAY2): +2 days"
echo "   Day 4 ($DAY3): +3 days"
echo "   Day 5 ($DAY4): +4 days"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Array of stores
STORES=(
    "backend/src/main/resources/data/deals.comprehensive.json:walmart:Walmart"
    "backend/src/main/resources/data/deals.target.json:target:Target"
    "backend/src/main/resources/data/deals.kroger.json:kroger:Kroger"
    "backend/src/main/resources/data/deals.safeway.json:safeway:Safeway"
)

DATES=("$TODAY" "$DAY1" "$DAY2" "$DAY3" "$DAY4")
TOTAL_IMPORTED=0

for date_idx in "${!DATES[@]}"; do
    date="${DATES[$date_idx]}"
    day_num=$((date_idx + 1))
    
    # Random discounts from 1-60% for every day (all days use same range)
    discount_desc="Random 1-60% OFF"
    discount_min=1
    discount_max=60
    
    echo "📆 Day $day_num - $date (Discounts: $discount_desc)"
    echo "-----------------------------------"
    
    for store_info in "${STORES[@]}"; do
        IFS=':' read -r file_path store_id store_name <<< "$store_info"
        
        if [ ! -f "$file_path" ]; then
            echo "   ⚠️  File not found: $file_path - Skipping"
            continue
        fi
        
        # Create random deals with varying discounts
        TEMP_FILE=$(mktemp)
        python3 "$SCRIPT_DIR/generate_random_deals.py" "$file_path" "$date" "$date_idx" "$discount_min" "$discount_max" "$TEMP_FILE"
        
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
echo "✨ Each day has RANDOM products with RANDOM discounts (1-60%):"
echo "   • Each product gets a random discount between 1% and 60%"
echo "   • Discounts vary for every product, every day"
echo ""
echo "   Try selecting different dates to see random products with varying discounts!"

