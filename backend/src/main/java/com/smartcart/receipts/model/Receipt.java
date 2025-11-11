package com.smartcart.receipts.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

import java.util.List;
import java.util.ArrayList;

@DynamoDbBean
public class Receipt {
    private String userId; // PK
    private String sortKey; // SK: RECEIPT#<receiptId>
    private String receiptId; // Extracted from sortKey for convenience
    private String s3KeyOriginal;
    private String s3KeyTextractJson;
    private String storeName;
    private Double total;
    private String purchasedAt;
    private String status; // "uploaded" | "processing" | "processed" | "failed"
    private List<ReceiptLineItem> lineItems;
    private long createdAt;
    
    private static final String RECEIPT_PREFIX = "RECEIPT#";
    
    public Receipt() {
        this.lineItems = new ArrayList<>();
    }
    
    public Receipt(String userId, String receiptId) {
        this.userId = userId;
        this.receiptId = receiptId;
        this.sortKey = RECEIPT_PREFIX + receiptId;
        this.status = "uploaded";
        this.lineItems = new ArrayList<>();
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
    
    @DynamoDbSortKey
    @DynamoDbAttribute("sortKey")
    public String getSortKey() {
        return sortKey;
    }
    
    public void setSortKey(String sortKey) {
        this.sortKey = sortKey;
        // Extract receiptId from sortKey for convenience
        if (sortKey != null && sortKey.startsWith(RECEIPT_PREFIX)) {
            this.receiptId = sortKey.substring(RECEIPT_PREFIX.length());
        }
    }
    
    // Helper method to set sortKey from receiptId
    public void setReceiptId(String receiptId) {
        this.receiptId = receiptId;
        if (receiptId != null && !receiptId.isEmpty()) {
            this.sortKey = RECEIPT_PREFIX + receiptId;
        }
    }
    
    @DynamoDbAttribute("receiptId")
    public String getReceiptId() {
        // Return extracted receiptId if available, otherwise extract from sortKey
        if (receiptId != null) {
            return receiptId;
        }
        if (sortKey != null && sortKey.startsWith(RECEIPT_PREFIX)) {
            return sortKey.substring(RECEIPT_PREFIX.length());
        }
        return null;
    }
    
    @DynamoDbAttribute("s3KeyOriginal")
    public String getS3KeyOriginal() {
        return s3KeyOriginal;
    }
    
    public void setS3KeyOriginal(String s3KeyOriginal) {
        this.s3KeyOriginal = s3KeyOriginal;
    }
    
    @DynamoDbAttribute("s3KeyTextractJson")
    public String getS3KeyTextractJson() {
        return s3KeyTextractJson;
    }
    
    public void setS3KeyTextractJson(String s3KeyTextractJson) {
        this.s3KeyTextractJson = s3KeyTextractJson;
    }
    
    @DynamoDbAttribute("storeName")
    public String getStoreName() {
        return storeName;
    }
    
    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }
    
    @DynamoDbAttribute("total")
    public Double getTotal() {
        return total;
    }
    
    public void setTotal(Double total) {
        this.total = total;
    }
    
    @DynamoDbAttribute("purchasedAt")
    public String getPurchasedAt() {
        return purchasedAt;
    }
    
    public void setPurchasedAt(String purchasedAt) {
        this.purchasedAt = purchasedAt;
    }
    
    @DynamoDbAttribute("status")
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    @DynamoDbAttribute("lineItems")
    public List<ReceiptLineItem> getLineItems() {
        return lineItems;
    }
    
    public void setLineItems(List<ReceiptLineItem> lineItems) {
        this.lineItems = lineItems != null ? lineItems : new ArrayList<>();
    }
    
    @DynamoDbAttribute("createdAt")
    public long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}

