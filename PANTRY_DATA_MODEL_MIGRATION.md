# PantryItems Data Model Migration

## ✅ Migration Complete

The PantryItems data model has been updated to match the specification exactly.

## Changes Made

### Before (Old Model)
- **PK**: `productId` (UUID)
- **SK**: None
- **Queries**: Used table scans (inefficient)

### After (New Model - Matches Spec)
- **PK**: `userId` (UUID)
- **SK**: `sortKey` = `ITEM#<canonicalProductId>`
- **Queries**: Uses efficient Query operations

## Files Modified

1. **`PantryItem.java`** - Model
   - Added `sortKey` field with `@DynamoDbSortKey`
   - Changed PK from `productId` to `userId` with `@DynamoDbPartitionKey`
   - Added helper methods to sync `productId` and `sortKey`

2. **`PantryRepository.java`** - Repository
   - `findByUserId()`: Now uses `query()` instead of `scan()`
   - `findByUserIdAndProductId()`: Uses `getItem()` with PK+SK
   - `delete()`: Updated to use PK+SK

3. **`PantryService.java`** - Service
   - Updated to use new repository methods
   - All CRUD operations work with new key structure

## Performance Improvements

- ✅ **No more table scans** - All queries use partition key lookups
- ✅ **O(1) item access** - Direct GetItem with PK+SK
- ✅ **Efficient range queries** - Can query by userId and filter by SK prefix
- ✅ **Scalable** - Each user's items are partitioned separately

## Backward Compatibility

- `productId` getter/setter still works (extracted from `sortKey`)
- DTOs unchanged
- API endpoints unchanged
- Frontend code unchanged

## DynamoDB Table Schema

**PantryItems Table:**
```
PK: userId (S)
SK: sortKey (S) - Format: "ITEM#<canonicalProductId>"

Attributes:
- name (S)
- quantity (N)
- unit (S)
- lastUpdated (S)
- estExpiry (S)
- source (S)
- packSize (S)
- categories (L)
```

## Migration Notes

**If migrating existing data:**
1. Old items have PK = productId (no SK)
2. New items have PK = userId, SK = ITEM#<productId>
3. For DynamoDB Local: Table will be recreated automatically
4. For production: Need to migrate existing data:
   ```python
   # Pseudocode for migration
   for old_item in scan_all_old_items():
       new_item = PantryItem()
       new_item.userId = old_item.userId  # Extract from item
       new_item.sortKey = f"ITEM#{old_item.productId}"
       # Copy all other attributes
       save(new_item)
   ```

## Testing

All CRUD operations tested and working:
- ✅ CREATE - New items use userId PK + ITEM# SK
- ✅ READ - Query by userId returns all user's items
- ✅ UPDATE - Updates work with PK+SK lookup
- ✅ DELETE - Deletion uses PK+SK

## API Usage (Unchanged)

```bash
# Get all pantry items for user
GET /api/pantry
# Authorization: Bearer <token>
# Returns: List of PantryItemDto

# Create new item
POST /api/pantry
# Body: { name, quantity, unit, estExpiry?, packSize?, categories? }

# Update item
PUT /api/pantry/{productId}
# Body: { name, quantity, unit, estExpiry?, packSize?, categories? }

# Delete item
DELETE /api/pantry/{productId}
```

## Next Steps

- ✅ Data model matches specification
- ✅ Efficient queries implemented
- ⏭️ Consider adding GSI if needed for category queries
- ⏭️ Add migration script for production deployment









