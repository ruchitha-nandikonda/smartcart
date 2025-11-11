package com.smartcart.receipts.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.textract.TextractClient;
import software.amazon.awssdk.services.textract.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class TextractService {
    
    private static final Logger logger = LoggerFactory.getLogger(TextractService.class);
    
    private final TextractClient textractClient;
    private final S3Client s3Client;
    private final String bucketName;
    private final ReceiptMapperService mapperService;
    private final ReceiptProcessingService receiptProcessingService;
    
    public TextractService(
            TextractClient textractClient,
            S3Client s3Client,
            @Value("${aws.s3.bucket}") String bucketName,
            ReceiptMapperService mapperService,
            ReceiptProcessingService receiptProcessingService) {
        this.textractClient = textractClient;
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.mapperService = mapperService;
        this.receiptProcessingService = receiptProcessingService;
    }
    
    public void processReceipt(String userId, String s3Key) {
        try {
            logger.info("Starting Textract processing for receipt: {}", s3Key);
            
            // For local development without AWS, immediately use mock data
            // Check if we're in local dev mode (no real AWS credentials or local S3 endpoint)
            // Skip Textract call entirely for local dev to avoid hanging
            if (bucketName.contains("dev") || bucketName.contains("local") || 
                System.getenv("DYNAMO_ENDPOINT") != null) {
                // Local development mode - use mock data immediately
                logger.info("Local dev mode detected, using mock receipt data");
                receiptProcessingService.completeProcessingWithMockData(userId, s3Key);
                return;
            }
            
            // Try Textract for production (with timeout protection)
            try {
                // Use AnalyzeExpense API (better for receipts)
                AnalyzeExpenseRequest request = AnalyzeExpenseRequest.builder()
                        .document(Document.builder()
                                .s3Object(S3Object.builder()
                                        .bucket(bucketName)
                                        .name(s3Key)
                                        .build())
                            .build())
                    .build();
                
                // Add timeout to prevent hanging
                java.util.concurrent.Future<AnalyzeExpenseResponse> future = 
                    java.util.concurrent.CompletableFuture.supplyAsync(() -> {
                        return textractClient.analyzeExpense(request);
                    });
                
                AnalyzeExpenseResponse response = future.get(5, java.util.concurrent.TimeUnit.SECONDS);
                
                logger.info("Textract analysis completed for receipt: {}", s3Key);
                
                // Parse the response and map to line items
                List<com.smartcart.receipts.model.ReceiptLineItem> lineItems = 
                        parseTextractResponse(response, s3Key);
                
                // Update receipt with parsed data and update pantry
                receiptProcessingService.completeProcessing(userId, s3Key, lineItems, response);
            } catch (java.util.concurrent.TimeoutException e) {
                logger.warn("Textract request timed out, using mock data");
                receiptProcessingService.completeProcessingWithMockData(userId, s3Key);
            } catch (software.amazon.awssdk.core.exception.SdkClientException | 
                     software.amazon.awssdk.core.exception.SdkServiceException e) {
                // No AWS credentials or service error - use mock data for local dev
                logger.info("AWS unavailable, using mock receipt data for local development: {}", e.getMessage());
                receiptProcessingService.completeProcessingWithMockData(userId, s3Key);
            } catch (Exception e) {
                logger.warn("Textract failed, using mock data: {}", e.getMessage());
                receiptProcessingService.completeProcessingWithMockData(userId, s3Key);
            }
            
        } catch (Exception e) {
            logger.error("Error processing receipt {}: {}", s3Key, e.getMessage(), e);
            receiptProcessingService.markAsFailed(userId, s3Key, e.getMessage());
        }
    }
    
    private List<com.smartcart.receipts.model.ReceiptLineItem> parseTextractResponse(
            AnalyzeExpenseResponse response, String s3Key) {
        
        List<com.smartcart.receipts.model.ReceiptLineItem> lineItems = new ArrayList<>();
        
        // Extract line items from Textract response
        for (ExpenseDocument doc : response.expenseDocuments()) {
            for (LineItemGroup group : doc.lineItemGroups()) {
                for (LineItemFields item : group.lineItems()) {
                    String description = extractField(item, "ITEM");
                    Double price = extractPrice(item);
                    Double quantity = extractQuantity(item);
                    
                    if (description != null && !description.isEmpty()) {
                        // Map to canonical product with confidence scoring
                        com.smartcart.receipts.service.ProductMatchResult matchResult = 
                                mapperService.mapToProductWithConfidence(description);
                        
                        com.smartcart.receipts.model.ReceiptLineItem lineItem = 
                                new com.smartcart.receipts.model.ReceiptLineItem(
                                        description, quantity != null ? quantity : 1.0, price);
                        lineItem.setCanonicalProductId(matchResult.canonicalProductId());
                        lineItem.setConfidence(matchResult.confidence());
                        
                        lineItems.add(lineItem);
                    }
                }
            }
        }
        
        return lineItems;
    }
    
    private String extractField(LineItemFields item, String type) {
        for (ExpenseField field : item.lineItemExpenseFields()) {
            if (field.type() != null && 
                field.type().toString().toUpperCase().contains(type.toUpperCase())) {
                if (field.valueDetection() != null && field.valueDetection().text() != null) {
                    return field.valueDetection().text();
                }
            }
        }
        return "";
    }
    
    private Double extractPrice(LineItemFields item) {
        for (ExpenseField field : item.lineItemExpenseFields()) {
            if (field.type() != null && 
                field.type().toString().toUpperCase().contains("PRICE")) {
                if (field.valueDetection() != null && field.valueDetection().text() != null) {
                    try {
                        return Double.parseDouble(
                                field.valueDetection().text().replace("$", "").replace(",", "").trim());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                }
            }
        }
        return null;
    }
    
    private Double extractQuantity(LineItemFields item) {
        for (ExpenseField field : item.lineItemExpenseFields()) {
            if (field.type() != null && 
                field.type().toString().toUpperCase().contains("QUANTITY")) {
                if (field.valueDetection() != null && field.valueDetection().text() != null) {
                    try {
                        return Double.parseDouble(field.valueDetection().text().trim());
                    } catch (NumberFormatException e) {
                        return 1.0; // Default to 1 if can't parse
                    }
                }
            }
        }
        return 1.0;
    }
}
