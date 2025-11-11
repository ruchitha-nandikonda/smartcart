# Receipts Data Model Migration

## ✅ Migration Complete

The Receipts data model has been updated to match the specification exactly.

## Changes Made

### Before (Old Model)
- **PK**: `receiptId` (or possibly different structure)
- **SK**: None or different
- **Queries**: Used table scans (inefficient)
- **Auth**: Used `X-User-Id` header

### After (New Model - Matches Spec)
- **PK**: `userId` (UUID)
- **SK**: `sortKey` = `RECEIPT#<receiptId>`
- **Queries**: Uses efficient Query operations
- **Auth**: Uses JWT (`@RequestAttribute("userId")`)

## Files Modified

1. **`Receipt.java`** - Model
   - Changed PK from receiptId to userId with `@DynamoDbPartitionKey`
   - Added `sortKey` field with `@DynamoDbSortKey`
   - SortKey format: `RECEIPT#<receiptId>`
   - Helper methods to sync `receiptId` and `sortKey`

2. **`ReceiptRepository.java`** - Repository
   - `findAllByUserId()`: Now uses `query()` instead of `scan()`
   - `findById()`: Uses `getItem()` with PK+SK
   - `save()`: Ensures sortKey is set before saving

3. **`ReceiptController.java`** - Controller
   - All endpoints updated to use `@RequestAttribute("userId")` instead of `@RequestHeader("X-User-Id")`
   - JWT authentication required for all endpoints

4. **`S3Service.java`** - Service
   - Properly injects `S3Presigner` bean
   - No longer hardcodes presigner as null

5. **`S3Config.java`** - Configuration
   - Added `@Bean` for `S3Presigner`

6. **`frontend/src/api/receipts.ts`** - Frontend API
   - Removed all `X-User-Id` headers
   - Uses JWT token from `apiClient` interceptor

## API Endpoints

### POST /api/receipts/upload
**Request:**
```bash
POST /api/receipts/upload?contentType=image/jpeg
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "uploadUrl": "https://...",
  "s3Key": "receipts/{userId}/{receiptId}.jpg"
}
```

### POST /api/receipts/confirm
**Request:**
```bash
POST /api/receipts/confirm
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "s3Key": "receipts/{userId}/{receiptId}.jpg"
}
```

**Response:**
```json
{
  "receiptId": "...",
  "status": "processing",
  "storeName": null,
  "total": null,
  ...
}
```

## DynamoDB Table Schema

**Receipts Table:**
```
PK: userId (S)
SK: sortKey (S) - Format: "RECEIPT#<receiptId>"

Attributes:
- receiptId (S) - Extracted from sortKey
- s3KeyOriginal (S)
- s3KeyTextractJson (S)
- storeName (S)
- total (N)
- purchasedAt (S)
- status (S)
- lineItems (L)
- createdAt (N)
```

## Migration Notes

**If migrating existing data:**
1. Old receipts may have PK = receiptId (no SK)
2. New receipts have PK = userId, SK = RECEIPT#<receiptId>
3. For DynamoDB Local: Table will be recreated automatically with new schema
4. For production: Need to migrate existing data:
   ```python
   # Pseudocode for migration
   for old_receipt in scan_all_old_receipts():
       new_receipt = Receipt()
       new_receipt.userId = old_receipt.userId
       new_receipt.sortKey = f"RECEIPT#{old_receipt.receiptId}"
       # Copy all other attributes
       save(new_receipt)
   ```

## Testing

✅ **Upload Endpoint**: Working
- Generates presigned URL
- Creates receipt record with status "uploaded"
- Returns uploadUrl and s3Key

⚠️ **Confirm Endpoint**: Partial
- DynamoDB schema issues with existing data
- Works for newly created receipts
- Needs table recreation for DynamoDB Local

✅ **List Receipts**: Working
- Query by userId returns all user's receipts
- Efficient query operation (not scan)

## Next Steps

1. ✅ Data model matches specification
2. ✅ Efficient queries implemented
3. ✅ JWT authentication integrated
4. ⏭️ Test Textract integration
5. ⏭️ Complete product mapper for receipt line items
6. ⏭️ Frontend receipt upload UI component

## Troubleshooting

**"One of the required keys was not given a value" error:**
- This happens when DynamoDB table has old schema items
- Solution: Delete DynamoDB Local data or recreate table
- For production: Migrate existing data first

**Receipt not found errors:**
- Check that sortKey is being set correctly
- Verify receiptId extraction from s3Key matches format
- Ensure receipt was created with new schema









