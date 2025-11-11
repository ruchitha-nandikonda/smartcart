# How to Import Deals - Step by Step Guide

## Prerequisites
- Backend running on port 8080
- DynamoDB Local running on port 8000 (or AWS DynamoDB)

## Step 1: Restart Backend (Required!)

The new DealsController needs to be loaded. **Stop and restart your backend:**

### If using START_BACKEND.sh:
```bash
# Stop current backend (Ctrl+C in terminal)
# Then restart:
cd /Users/ruchithanandikonda/Desktop/Project/smartcart
./START_BACKEND.sh
```

### If using Maven directly:
```bash
# Stop current backend (Ctrl+C)
# Then restart:
cd /Users/ruchithanandikonda/Desktop/Project/smartcart/backend
mvn spring-boot:run
```

**Wait for:** Look for these log messages:
- ✅ "Creating table 'Deals'..." or "Table 'Deals' already exists"
- ✅ "Started SmartCartApplication"

## Step 2: Verify Backend is Ready

```bash
curl http://localhost:8080/actuator/health
```

Should return: `{"status":"UP",...}`

## Step 3: Import Deals

### Option A: Using curl (Terminal)
```bash
cd /Users/ruchithanandikonda/Desktop/Project/smartcart

curl -X POST http://localhost:8080/api/deals/admin/import \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: admin-secret-token-change-in-production" \
  -d @backend/src/main/resources/data/deals.comprehensive.json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully imported 29 deals",
  "importedCount": 29,
  "storeId": "walmart",
  "date": "20241104"
}
```

### Option B: Using Postman/Insomnia
1. **Method:** POST
2. **URL:** `http://localhost:8080/api/deals/admin/import`
3. **Headers:**
   - `Content-Type: application/json`
   - `X-Admin-Token: admin-secret-token-change-in-production`
4. **Body:** Copy contents from `backend/src/main/resources/data/deals.comprehensive.json`

## Step 4: Verify Deals Were Imported

```bash
# Get all deals
curl http://localhost:8080/api/deals

# Get Walmart deals
curl http://localhost:8080/api/deals?storeId=walmart
```

Should return a JSON array of deals.

## Step 5: Test in Shopping List

1. Go to **Meal Planning** page
2. Select some meals
3. Click **Generate Shopping List**
4. Check the **Notes** section - items like:
   - ✅ Baguette (should have deal now)
   - ✅ Mayonnaise (should have deal now)
   - ✅ Pork Cutlets (should have deal now)
   - ✅ Cabbage (should have deal now)
   - ✅ Cilantro (should have deal now)

**Fewer "No deal found" messages** = Success! 🎉

## Troubleshooting

### Error: "No static resource api/deals"
**Solution:** Backend needs restart. See Step 1.

### Error: "Unauthorized. Admin token required"
**Solution:** Check that `X-Admin-Token` header is set correctly:
```
X-Admin-Token: admin-secret-token-change-in-production
```

### Error: "Cannot do operations on a non-existent table"
**Solution:** 
1. Check DynamoDB is running: `curl http://localhost:8000`
2. Check backend logs for table creation errors
3. Restart backend to trigger table initialization

### No deals showing in optimizer
**Solution:**
1. Verify deals were imported: `curl http://localhost:8080/api/deals`
2. Check date format - today's date should be `YYYYMMDD` (e.g., `20241104`)
3. Check backend logs for errors loading deals

## What's Included in deals.comprehensive.json

✅ **All items from your "No deal found" list:**
- Baguette
- Mayonnaise
- Panko
- Pickled Vegetables
- Cabbage
- Cilantro
- Pork Cutlets
- Pork

✅ **Plus 20+ common ingredients:**
- Chicken Breast, Ground Beef, Salmon
- Eggs, Milk, Rice, Bread
- Onions, Garlic, Tomatoes
- Lettuce, Bell Peppers, Carrots
- Potatoes, Flour, Pasta
- Cheese, Butter, Tortillas
- And more!

## Next Steps

After importing, the optimizer will:
- ✅ Use real Walmart prices
- ✅ Show actual savings
- ✅ Reduce "No deal found" messages
- ✅ Better cost breakdown by store

You can also import deals for other stores (Target, Kroger) by creating similar JSON files with different `storeId` values.

