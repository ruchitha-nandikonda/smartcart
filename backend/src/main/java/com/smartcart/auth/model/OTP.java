package com.smartcart.auth.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

@DynamoDbBean
public class OTP {
    private String email; // PK
    private String type; // SK: REGISTRATION, PASSWORD_RESET
    private String otpCode;
    private long expiresAt;
    private long createdAt;
    private int attempts;
    
    public OTP() {}
    
    public OTP(String email, String type, String otpCode, long expiresAt) {
        this.email = email;
        this.type = type;
        this.otpCode = otpCode;
        this.expiresAt = expiresAt;
        this.createdAt = System.currentTimeMillis();
        this.attempts = 0;
    }
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("email")
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("type")
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    @DynamoDbAttribute("otpCode")
    public String getOtpCode() {
        return otpCode;
    }
    
    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }
    
    @DynamoDbAttribute("expiresAt")
    public long getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(long expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    @DynamoDbAttribute("createdAt")
    public long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
    
    @DynamoDbAttribute("attempts")
    public int getAttempts() {
        return attempts;
    }
    
    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }
    
    public boolean isExpired() {
        return System.currentTimeMillis() > expiresAt;
    }
    
    public void incrementAttempts() {
        this.attempts++;
    }
}





