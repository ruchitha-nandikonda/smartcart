package com.smartcart.receipts.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

@DynamoDbBean
public class ReceiptLineItem {
    private String rawDesc;
    private Double qty;
    private Double price;
    private String canonicalProductId;
    private Double confidence;
    
    public ReceiptLineItem() {}
    
    public ReceiptLineItem(String rawDesc, Double qty, Double price) {
        this.rawDesc = rawDesc;
        this.qty = qty;
        this.price = price;
    }
    
    @DynamoDbAttribute("rawDesc")
    public String getRawDesc() {
        return rawDesc;
    }
    
    public void setRawDesc(String rawDesc) {
        this.rawDesc = rawDesc;
    }
    
    @DynamoDbAttribute("qty")
    public Double getQty() {
        return qty;
    }
    
    public void setQty(Double qty) {
        this.qty = qty;
    }
    
    @DynamoDbAttribute("price")
    public Double getPrice() {
        return price;
    }
    
    public void setPrice(Double price) {
        this.price = price;
    }
    
    @DynamoDbAttribute("canonicalProductId")
    public String getCanonicalProductId() {
        return canonicalProductId;
    }
    
    public void setCanonicalProductId(String canonicalProductId) {
        this.canonicalProductId = canonicalProductId;
    }
    
    @DynamoDbAttribute("confidence")
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
}

