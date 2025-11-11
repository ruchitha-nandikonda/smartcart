package com.smartcart.shoppinglist.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

import java.util.List;
import java.util.Map;

@DynamoDbBean
public class ShoppingListHistory {
    private String userId;
    private String listId;
    private Long createdAt;
    private List<ShoppingListItem> items;
    private Map<String, Double> costByStore;
    private Double totalCost;
    private List<String> meals;
    private Integer totalServings;
    private List<String> usesPantry;
    
    public ShoppingListHistory() {}
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("listId")
    public String getListId() {
        return listId;
    }
    
    public void setListId(String listId) {
        this.listId = listId;
    }
    
    @DynamoDbAttribute("createdAt")
    public Long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
    
    @DynamoDbAttribute("items")
    public List<ShoppingListItem> getItems() {
        return items;
    }
    
    public void setItems(List<ShoppingListItem> items) {
        this.items = items;
    }
    
    @DynamoDbAttribute("costByStore")
    public Map<String, Double> getCostByStore() {
        return costByStore;
    }
    
    public void setCostByStore(Map<String, Double> costByStore) {
        this.costByStore = costByStore;
    }
    
    @DynamoDbAttribute("totalCost")
    public Double getTotalCost() {
        return totalCost;
    }
    
    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }
    
    @DynamoDbAttribute("meals")
    public List<String> getMeals() {
        return meals;
    }
    
    public void setMeals(List<String> meals) {
        this.meals = meals;
    }
    
    @DynamoDbAttribute("totalServings")
    public Integer getTotalServings() {
        return totalServings;
    }
    
    public void setTotalServings(Integer totalServings) {
        this.totalServings = totalServings;
    }
    
    @DynamoDbAttribute("usesPantry")
    public List<String> getUsesPantry() {
        return usesPantry;
    }
    
    public void setUsesPantry(List<String> usesPantry) {
        this.usesPantry = usesPantry;
    }
    
    @DynamoDbBean
    public static class ShoppingListItem {
        private String productId;
        private Double qty;
        private String unit;
        private String storeId;
        private Double price;
        
        public ShoppingListItem() {}
        
        public ShoppingListItem(String productId, Double qty, String unit, String storeId, Double price) {
            this.productId = productId;
            this.qty = qty;
            this.unit = unit;
            this.storeId = storeId;
            this.price = price;
        }
        
        public String getProductId() {
            return productId;
        }
        
        public void setProductId(String productId) {
            this.productId = productId;
        }
        
        public Double getQty() {
            return qty;
        }
        
        public void setQty(Double qty) {
            this.qty = qty;
        }
        
        public String getUnit() {
            return unit;
        }
        
        public void setUnit(String unit) {
            this.unit = unit;
        }
        
        public String getStoreId() {
            return storeId;
        }
        
        public void setStoreId(String storeId) {
            this.storeId = storeId;
        }
        
        public Double getPrice() {
            return price;
        }
        
        public void setPrice(Double price) {
            this.price = price;
        }
    }
}

