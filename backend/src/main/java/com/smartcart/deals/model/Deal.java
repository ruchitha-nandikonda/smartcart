package com.smartcart.deals.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

import java.time.LocalDate;

@DynamoDbBean
public class Deal {
    private String storeIdDate; // Composite PK: storeId#YYYYMMDD
    private String productId; // SK: PRODUCT#<productId>
    private String storeId;
    private String date;
    private String storeName;
    private String productName;
    private String sizeText;
    private Double unitPrice;
    private Double promoPrice;
    private LocalDate promoEnds;
    private String sourceUrl;
    
    public Deal() {}
    
    public Deal(String storeId, String date, String productId, String storeName, 
                String productName, String sizeText, Double unitPrice, Double promoPrice, 
                LocalDate promoEnds, String sourceUrl) {
        this.storeId = storeId;
        this.date = date;
        this.storeIdDate = storeId + "#" + date; // Composite partition key
        this.productId = "PRODUCT#" + productId; // Sort key with prefix
        this.storeName = storeName;
        this.productName = productName;
        this.sizeText = sizeText;
        this.unitPrice = unitPrice;
        this.promoPrice = promoPrice;
        this.promoEnds = promoEnds;
        this.sourceUrl = sourceUrl;
    }
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("storeIdDate")
    public String getStoreIdDate() {
        return storeIdDate;
    }
    
    public void setStoreIdDate(String storeIdDate) {
        this.storeIdDate = storeIdDate;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("productId")
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    @DynamoDbAttribute("storeId")
    public String getStoreId() {
        return storeId;
    }
    
    public void setStoreId(String storeId) {
        this.storeId = storeId;
        // Update composite key when storeId changes
        if (this.date != null) {
            this.storeIdDate = storeId + "#" + this.date;
        }
    }
    
    @DynamoDbAttribute("date")
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
        // Update composite key when date changes
        if (this.storeId != null) {
            this.storeIdDate = this.storeId + "#" + date;
        }
    }
    
    @DynamoDbAttribute("storeName")
    public String getStoreName() {
        return storeName;
    }
    
    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }
    
    @DynamoDbAttribute("productName")
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    @DynamoDbAttribute("sizeText")
    public String getSizeText() {
        return sizeText;
    }
    
    public void setSizeText(String sizeText) {
        this.sizeText = sizeText;
    }
    
    @DynamoDbAttribute("unitPrice")
    public Double getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    @DynamoDbAttribute("promoPrice")
    public Double getPromoPrice() {
        return promoPrice;
    }
    
    public void setPromoPrice(Double promoPrice) {
        this.promoPrice = promoPrice;
    }
    
    @DynamoDbAttribute("promoEnds")
    public LocalDate getPromoEnds() {
        return promoEnds;
    }
    
    public void setPromoEnds(LocalDate promoEnds) {
        this.promoEnds = promoEnds;
    }
    
    @DynamoDbAttribute("sourceUrl")
    public String getSourceUrl() {
        return sourceUrl;
    }
    
    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }
}

