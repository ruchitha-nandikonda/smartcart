package com.smartcart.favorites.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

import java.util.Map;

@DynamoDbBean
public class MealFavorite {
    private String userId;
    private String favoriteId;
    private String name;
    private Map<String, Integer> mealServings; // mealId -> servings
    private Long createdAt;
    private Long lastUsed;
    
    public MealFavorite() {}
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("favoriteId")
    public String getFavoriteId() {
        return favoriteId;
    }
    
    public void setFavoriteId(String favoriteId) {
        this.favoriteId = favoriteId;
    }
    
    @DynamoDbAttribute("name")
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    @DynamoDbAttribute("mealServings")
    public Map<String, Integer> getMealServings() {
        return mealServings;
    }
    
    public void setMealServings(Map<String, Integer> mealServings) {
        this.mealServings = mealServings;
    }
    
    @DynamoDbAttribute("createdAt")
    public Long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
    
    @DynamoDbAttribute("lastUsed")
    public Long getLastUsed() {
        return lastUsed;
    }
    
    public void setLastUsed(Long lastUsed) {
        this.lastUsed = lastUsed;
    }
}

