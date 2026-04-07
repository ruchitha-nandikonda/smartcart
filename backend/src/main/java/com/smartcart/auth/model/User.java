package com.smartcart.auth.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

@DynamoDbBean
public class User {
    private String userId;
    /** Login name; stored under DynamoDB attribute "email" for backward compatibility with existing tables. */
    private String username;
    private String hashedPassword;
    private long createdAt;
    
    public User() {}
    
    public User(String userId, String username, String hashedPassword) {
        this.userId = userId;
        this.username = username;
        this.hashedPassword = hashedPassword;
        this.createdAt = System.currentTimeMillis();
    }
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    @DynamoDbAttribute("email")
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    @DynamoDbAttribute("hashedPassword")
    public String getHashedPassword() {
        return hashedPassword;
    }
    
    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }
    
    @DynamoDbAttribute("createdAt")
    public long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
