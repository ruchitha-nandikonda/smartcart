# Deals Import System - User Guide

## Overview

The Deals Import System allows administrators to import store deals data into SmartCart. This enables the shopping list optimizer to use real store prices instead of mock data.

## Features

✅ **Admin Import Endpoint** - Secure endpoint to import deals JSON  
✅ **DynamoDB Storage** - Deals stored in DynamoDB with proper schema  
✅ **Automatic Integration** - OptimizerService automatically uses real deals  
✅ **Fallback Support** - Falls back to mock data if no real deals found  

## API Endpoint

### POST `/api/deals/admin/import`

**Authentication:** Requires `X-Admin-Token` header

**Request Body:**
```json
{
  "storeId": "walmart",
  "storeName": "Walmart",
  "date": "20241104",
  "sourceUrl": "https://www.walmart.com/weekly-ads",
  "deals": [
    {
      "productId": "chicken-breast",
      "productName": "Chicken Breast",
      "sizeText": "1 lb",
      "unitPrice": 6.99,
      "promoPrice": 5.99,
      "promoEnds": "2024-11-10"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully imported 10 deals",
  "importedCount": 10,
  "storeId": "walmart",
  "date": "20241104"
}
```

## How to Use

### 1. Import Sample Deals

```bash
curl -X POST http://localhost:8080/api/deals/admin/import \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: admin-secret-token-change-in-production" \
  -d @backend/src/main/resources/data/deals.sample.json
```

### 2. Query Deals

```bash
# Get all deals
curl http://localhost:8080/api/deals

# Get deals for specific store
curl http://localhost:8080/api/deals?storeId=walmart

# Get deals for specific store and date
curl http://localhost:8080/api/deals?storeId=walmart&date=20241104
```

### 3. Integration with Optimizer

The `OptimizerService` automatically:
- Loads deals from DynamoDB when generating shopping lists
- Uses today's deals (or most recent if none for today)
- Falls back to mock data if database is empty
- Matches products using case-insensitive and partial matching

## Data Schema

### Deal Model
- **PK:** `storeIdDate` (format: `storeId#YYYYMMDD`)
- **SK:** `productId` (format: `PRODUCT#<productId>`)
- **Fields:**
  - `storeId` - Store identifier (e.g., "walmart")
  - `date` - Date in YYYYMMDD format
  - `storeName` - Human-readable store name
  - `productId` - Product identifier
  - `productName` - Product name (used for matching)
  - `sizeText` - Size description (e.g., "1 lb")
  - `unitPrice` - Regular price
  - `promoPrice` - Sale price (used if available)
  - `promoEnds` - Promo end date (ISO format)
  - `sourceUrl` - Source URL for the deal

## Date Format

- **Partition Key Date:** `YYYYMMDD` (e.g., "20241104")
- **Promo End Date:** ISO format `YYYY-MM-DD` (e.g., "2024-11-10")

## Security

⚠️ **Important:** Change the admin token in production!

Current token (for development only): `admin-secret-token-change-in-production`

To change:
1. Update `DealsController.ADMIN_TOKEN` constant
2. Or use environment variable for production

## Sample JSON File

See `backend/src/main/resources/data/deals.sample.json` for a complete example.

## Troubleshooting

### Deals not appearing in optimizer
1. Check if deals were imported: `GET /api/deals`
2. Verify date format matches today (YYYYMMDD)
3. Check backend logs for errors
4. OptimizerService falls back to mock data if no deals found

### Import fails
1. Verify `X-Admin-Token` header is correct
2. Check JSON format matches schema
3. Ensure date is in YYYYMMDD format
4. Check DynamoDB is running

## Next Steps

- [ ] Add scheduled job to pull deals daily
- [ ] Add deals UI page for browsing
- [ ] Add deals expiration cleanup job
- [ ] Add multiple store support in import
- [ ] Add deals history/versioning

