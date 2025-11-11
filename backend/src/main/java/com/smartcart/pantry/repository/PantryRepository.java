package com.smartcart.pantry.repository;

import com.smartcart.pantry.model.PantryItem;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class PantryRepository {
    
    private final DynamoDbTable<PantryItem> pantryTable;
    private static final String TABLE_NAME = "PantryItems";
    private static final String ITEM_PREFIX = "ITEM#";
    
    @Autowired
    public PantryRepository(DynamoDbEnhancedClient enhancedClient) {
        this.pantryTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(PantryItem.class));
    }
    
    public void save(PantryItem item) {
        // Ensure sortKey is set properly
        if (item.getSortKey() == null || item.getSortKey().isEmpty()) {
            String productId = item.getProductId();
            if (productId != null && !productId.isEmpty()) {
                item.setSortKey(ITEM_PREFIX + productId);
            }
        }
        pantryTable.putItem(item);
    }
    
    public PantryItem findByUserIdAndProductId(String userId, String productId) {
        String sortKey = ITEM_PREFIX + productId;
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(sortKey)
                .build();
        return pantryTable.getItem(key);
    }
    
    public List<PantryItem> findByUserId(String userId) {
        // Query all items for this user (all items with sortKey starting with ITEM#)
        // Query by partition key only - this will return all items for the user
        try {
            return pantryTable.query(r -> r
                    .queryConditional(QueryConditional.keyEqualTo(Key.builder()
                            .partitionValue(userId)
                            .build()))
            )
            .items()
            .stream()
            .filter(item -> item.getSortKey() != null && item.getSortKey().startsWith(ITEM_PREFIX))
            .collect(Collectors.toList());
        } catch (Exception e) {
            // If query fails (e.g., table doesn't exist or wrong schema), try scan as fallback
            // This is a temporary workaround for development
            try {
                return pantryTable.scan()
                        .items()
                        .stream()
                        .filter(item -> userId.equals(item.getUserId()) && 
                                item.getSortKey() != null && 
                                item.getSortKey().startsWith(ITEM_PREFIX))
                        .collect(Collectors.toList());
            } catch (Exception scanEx) {
                // Table might not exist yet - return empty list
                return List.of();
            }
        }
    }
    
    public void delete(String userId, String productId) {
        // First, get the item to ensure it exists
        PantryItem item = findByUserIdAndProductId(userId, productId);
        if (item == null) {
            throw new RuntimeException("Pantry item not found for deletion");
        }
        
        // Ensure userId and sortKey are set on the item (Enhanced Client needs these)
        if (item.getUserId() == null || item.getUserId().isEmpty()) {
            item.setUserId(userId);
        }
        if (item.getSortKey() == null || item.getSortKey().isEmpty()) {
            item.setSortKey(ITEM_PREFIX + productId);
        }
        
        // Delete using the item directly - Enhanced Client will extract keys from annotations
        pantryTable.deleteItem(item);
    }
    
    public void deleteAllByUserId(String userId) {
        List<PantryItem> items = findByUserId(userId);
        for (PantryItem item : items) {
            pantryTable.deleteItem(item);
        }
    }
}
