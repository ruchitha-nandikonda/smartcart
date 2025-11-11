package com.smartcart.pantry.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

import java.util.List;

@DynamoDbBean
public class PantryItem {
    private String userId; // PK
    private String sortKey; // SK: ITEM#<canonicalProductId>
    private String productId; // Extracted from sortKey for convenience
    private String name;
    private double quantity;
    private String unit;
    private String lastUpdated;
    private String estExpiry;
    private String source;
    private String packSize;
    private List<String> categories;
    
    public PantryItem() {}
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("sortKey")
    public String getSortKey() {
        return sortKey;
    }
    
    public void setSortKey(String sortKey) {
        this.sortKey = sortKey;
        // Extract productId from sortKey for convenience
        if (sortKey != null && sortKey.startsWith("ITEM#")) {
            this.productId = sortKey.substring(5);
        }
    }
    
    // Helper method to set sortKey from productId
    public void setProductId(String productId) {
        this.productId = productId;
        if (productId != null && !productId.isEmpty()) {
            this.sortKey = "ITEM#" + productId;
        }
    }
    
    @DynamoDbAttribute("productId")
    public String getProductId() {
        // Return extracted productId if available, otherwise extract from sortKey
        if (productId != null) {
            return productId;
        }
        if (sortKey != null && sortKey.startsWith("ITEM#")) {
            return sortKey.substring(5);
        }
        return null;
    }
    
    @DynamoDbAttribute("name")
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    @DynamoDbAttribute("quantity")
    public double getQuantity() {
        return quantity;
    }
    
    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }
    
    @DynamoDbAttribute("unit")
    public String getUnit() {
        return unit;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    @DynamoDbAttribute("lastUpdated")
    public String getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    @DynamoDbAttribute("estExpiry")
    public String getEstExpiry() {
        return estExpiry;
    }
    
    public void setEstExpiry(String estExpiry) {
        this.estExpiry = estExpiry;
    }
    
    @DynamoDbAttribute("source")
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    @DynamoDbAttribute("packSize")
    public String getPackSize() {
        return packSize;
    }
    
    public void setPackSize(String packSize) {
        this.packSize = packSize;
    }
    
    @DynamoDbAttribute("categories")
    public List<String> getCategories() {
        return categories;
    }
    
    public void setCategories(List<String> categories) {
        this.categories = categories;
    }
}
