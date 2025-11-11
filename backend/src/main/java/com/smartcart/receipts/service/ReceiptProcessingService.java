package com.smartcart.receipts.service;

import com.smartcart.receipts.model.Receipt;
import com.smartcart.receipts.model.ReceiptLineItem;
import com.smartcart.receipts.repository.ReceiptRepository;
import com.smartcart.pantry.model.PantryItem;
import com.smartcart.pantry.repository.PantryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.textract.model.AnalyzeExpenseResponse;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReceiptProcessingService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReceiptProcessingService.class);
    
    @Autowired
    private ReceiptRepository receiptRepository;
    
    @Autowired
    private PantryRepository pantryRepository;
    
    public void completeProcessing(
            String userId,
            String s3Key,
            List<ReceiptLineItem> lineItems,
            AnalyzeExpenseResponse textractResponse) {
        
        try {
            // Find receipt by s3Key (extract receiptId from s3Key)
            String receiptId = extractReceiptIdFromS3Key(s3Key);
            Receipt receipt = receiptRepository.findById(userId, receiptId);
            
            if (receipt == null) {
                logger.error("Receipt not found for userId: {}, s3Key: {}", userId, s3Key);
                return;
            }
            
            // Extract store name and total from Textract response
            String storeName = extractStoreName(textractResponse);
            Double total = extractTotal(textractResponse);
            String purchasedAt = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
            
            // Update receipt
            receipt.setStatus("processed");
            receipt.setLineItems(lineItems);
            receipt.setStoreName(storeName);
            receipt.setTotal(total);
            receipt.setPurchasedAt(purchasedAt);
            
            receiptRepository.save(receipt);
            
            // Update pantry with items that have canonical product IDs
            updatePantryFromReceipt(userId, lineItems);
            
            logger.info("Receipt processing completed for userId: {}, receiptId: {}", userId, receiptId);
            
        } catch (Exception e) {
            logger.error("Error completing receipt processing: {}", e.getMessage(), e);
            markAsFailed(userId, s3Key, e.getMessage());
        }
    }
    
    public void completeProcessingWithMockData(String userId, String s3Key) {
        try {
            String receiptId = extractReceiptIdFromS3Key(s3Key);
            Receipt receipt = receiptRepository.findById(userId, receiptId);
            
            if (receipt == null) {
                logger.error("Receipt not found for userId: {}, s3Key: {}", userId, s3Key);
                return;
            }
            
            // Create mock line items for local development
            List<ReceiptLineItem> lineItems = new ArrayList<>();
            
            ReceiptLineItem milk = new ReceiptLineItem("Milk - 1 Gallon", 1.0, 3.49);
            milk.setCanonicalProductId("milk");
            milk.setConfidence(0.95);
            lineItems.add(milk);
            
            ReceiptLineItem bread = new ReceiptLineItem("Whole Wheat Bread", 1.0, 2.99);
            bread.setCanonicalProductId("bread");
            bread.setConfidence(0.90);
            lineItems.add(bread);
            
            ReceiptLineItem eggs = new ReceiptLineItem("Large Eggs - 12 count", 1.0, 4.29);
            eggs.setCanonicalProductId("eggs");
            eggs.setConfidence(0.92);
            lineItems.add(eggs);
            
            receipt.setStatus("processed");
            receipt.setLineItems(lineItems);
            receipt.setStoreName("Local Test Store");
            receipt.setTotal(31.28);
            receipt.setPurchasedAt(LocalDate.now().format(DateTimeFormatter.ISO_DATE));
            
            receiptRepository.save(receipt);
            
            // Update pantry with items
            updatePantryFromReceipt(userId, lineItems);
            
            logger.info("Receipt processing completed with mock data for userId: {}, receiptId: {}", userId, receiptId);
            
        } catch (Exception e) {
            logger.error("Error completing receipt processing with mock data: {}", e.getMessage(), e);
            markAsFailed(userId, s3Key, e.getMessage());
        }
    }
    
    public void markAsFailed(String userId, String s3Key, String errorMessage) {
        try {
            String receiptId = extractReceiptIdFromS3Key(s3Key);
            Receipt receipt = receiptRepository.findById(userId, receiptId);
            
            if (receipt != null) {
                receipt.setStatus("failed");
                receiptRepository.save(receipt);
                logger.error("Marked receipt as failed: userId={}, receiptId={}, error={}", 
                        userId, receiptId, errorMessage);
            }
        } catch (Exception e) {
            logger.error("Error marking receipt as failed: {}", e.getMessage(), e);
        }
    }
    
    private String extractReceiptIdFromS3Key(String s3Key) {
        // s3Key format: receipts/{userId}/{receiptId}.{ext}
        String[] parts = s3Key.split("/");
        if (parts.length >= 3) {
            String filename = parts[parts.length - 1];
            return filename.substring(0, filename.lastIndexOf('.'));
        }
        return UUID.randomUUID().toString();
    }
    
    private String extractStoreName(AnalyzeExpenseResponse response) {
        // Try to extract vendor/store name from summary fields
        return response.expenseDocuments().stream()
                .flatMap(doc -> doc.summaryFields().stream())
                .filter(field -> field.type().toString().equals("VENDOR_NAME"))
                .findFirst()
                .map(field -> field.valueDetection() != null ? 
                        field.valueDetection().text() : "Unknown Store")
                .orElse("Unknown Store");
    }
    
    private Double extractTotal(AnalyzeExpenseResponse response) {
        return response.expenseDocuments().stream()
                .flatMap(doc -> doc.summaryFields().stream())
                .filter(field -> field.type().toString().equals("TOTAL"))
                .findFirst()
                .map(field -> {
                    if (field.valueDetection() != null && 
                        field.valueDetection().text() != null) {
                        try {
                            return Double.parseDouble(
                                    field.valueDetection().text().replace("$", "").trim());
                        } catch (NumberFormatException e) {
                            return null;
                        }
                    }
                    return null;
                })
                .orElse(null);
    }
    
    private void updatePantryFromReceipt(String userId, List<ReceiptLineItem> lineItems) {
        for (ReceiptLineItem item : lineItems) {
            if (item.getCanonicalProductId() != null && item.getQty() != null) {
                try {
                    // Check if item already exists in pantry
                    PantryItem existing = pantryRepository.findByUserIdAndProductId(
                            userId, item.getCanonicalProductId());
                    
                    if (existing != null) {
                        // Update quantity
                        existing.setQuantity(existing.getQuantity() + item.getQty());
                        existing.setLastUpdated(String.valueOf(System.currentTimeMillis()));
                        pantryRepository.save(existing);
                    } else {
                    // Create new pantry item
                    PantryItem newItem = new PantryItem();
                    newItem.setUserId(userId);
                    newItem.setProductId(item.getCanonicalProductId());
                    newItem.setName(item.getCanonicalProductId()); // Use canonical ID as name for now
                    newItem.setQuantity(item.getQty());
                    newItem.setUnit("unit");
                    newItem.setLastUpdated(String.valueOf(System.currentTimeMillis()));
                    newItem.setSource("receipt");
                    pantryRepository.save(newItem);
                    }
                } catch (Exception e) {
                    logger.error("Error updating pantry for item {}: {}", 
                            item.getCanonicalProductId(), e.getMessage());
                }
            }
        }
    }
}

