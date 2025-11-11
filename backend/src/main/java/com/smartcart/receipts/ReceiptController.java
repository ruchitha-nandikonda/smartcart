package com.smartcart.receipts;

import com.smartcart.receipts.dto.ConfirmRequest;
import com.smartcart.receipts.dto.PresignResponse;
import com.smartcart.receipts.dto.ReceiptResponse;
import com.smartcart.receipts.model.Receipt;
import com.smartcart.receipts.repository.ReceiptRepository;
import com.smartcart.receipts.service.S3Service;
import com.smartcart.receipts.service.TextractService;
import com.smartcart.receipts.service.FileValidationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReceiptController.class);
    
    private final S3Service s3Service;
    private final ReceiptRepository receiptRepository;
    private final TextractService textractService;
    private final FileValidationService fileValidationService;
    
    public ReceiptController(
            S3Service s3Service,
            ReceiptRepository receiptRepository,
            TextractService textractService,
            FileValidationService fileValidationService) {
        this.s3Service = s3Service;
        this.receiptRepository = receiptRepository;
        this.textractService = textractService;
        this.fileValidationService = fileValidationService;
    }
    
    /**
     * Mock upload endpoint for local development
     */
    @PutMapping("/mock-upload/{*s3Key}")
    public ResponseEntity<Void> mockUpload(@PathVariable String s3Key) {
        // Accept any upload for local development
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get pre-signed S3 URL for uploading receipt
     */
    @PostMapping("/upload")
    public ResponseEntity<PresignResponse> presignUpload(
            @RequestAttribute("userId") String userId,
            @RequestParam(value = "contentType", defaultValue = "image/jpeg") String contentType) {
        
        // Validate content type
        fileValidationService.validateContentType(contentType);
        
        S3Service.PresignedUploadInfo uploadInfo = s3Service.generatePresignedUploadUrl(userId, contentType);
        
        // Create receipt record in "uploaded" status
        try {
            Receipt receipt = new Receipt(userId, uploadInfo.receiptId());
            receipt.setS3KeyOriginal(uploadInfo.s3Key());
            receipt.setStatus("uploaded");
            // Ensure sortKey is set (constructor should handle this, but double-check)
            if (receipt.getSortKey() == null || receipt.getSortKey().isEmpty()) {
                receipt.setReceiptId(uploadInfo.receiptId()); // This will set sortKey
            }
            receiptRepository.save(receipt);
            logger.debug("Created receipt record: userId={}, receiptId={}, sortKey={}", 
                    userId, uploadInfo.receiptId(), receipt.getSortKey());
        } catch (Exception e) {
            // Log but don't fail - receipt will be created on confirm
            logger.warn("Could not save receipt to database (local dev?): {}", e.getMessage(), e);
        }
        
        return ResponseEntity.ok(new PresignResponse(uploadInfo.uploadUrl(), uploadInfo.s3Key()));
    }
    
    /**
     * Direct upload endpoint for local development (alternative to S3)
     */
    @PostMapping("/direct-upload")
    public ResponseEntity<ReceiptResponse> directUpload(
            @RequestAttribute("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        
        // Validate file
        fileValidationService.validateFile(file);
        
        String receiptId = UUID.randomUUID().toString();
        String s3Key = String.format("receipts/%s/%s.%s", 
                userId, receiptId, 
                file.getOriginalFilename() != null && file.getOriginalFilename().contains(".") 
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".") + 1)
                    : "jpg");
        
        // Create receipt record
        Receipt receipt = new Receipt(userId, receiptId);
        receipt.setS3KeyOriginal(s3Key);
        receipt.setStatus("uploaded");
        receiptRepository.save(receipt);
        
        // For local dev, mark as processed immediately with mock data
        // In production, this would trigger Textract processing
        receipt.setStatus("processed");
        receipt.setStoreName("Local Store");
        receipt.setTotal(31.28);
        receipt.setPurchasedAt(java.time.LocalDate.now().toString());
        receiptRepository.save(receipt);
        
        return ResponseEntity.ok(ReceiptResponse.fromReceipt(receipt));
    }
    
    /**
     * Confirm upload and trigger Textract processing
     */
    @PostMapping("/confirm")
    public ResponseEntity<ReceiptResponse> confirmUpload(
            @RequestAttribute("userId") String userId,
            @Valid @RequestBody ConfirmRequest request) {
        
        // Extract receiptId from s3Key
        String receiptId = extractReceiptIdFromS3Key(request.s3Key());
        logger.debug("Confirming upload: userId={}, receiptId={}, s3Key={}", userId, receiptId, request.s3Key());
        
        // Find and update receipt status
        Receipt receipt = receiptRepository.findById(userId, receiptId);
        if (receipt == null) {
            // Receipt might not exist if upload failed - create it now
            logger.info("Receipt not found, creating new receipt record: userId={}, receiptId={}", userId, receiptId);
            receipt = new Receipt(userId, receiptId);
            receipt.setS3KeyOriginal(request.s3Key());
            receipt.setStatus("uploaded");
            // Ensure sortKey is set before saving
            if (receipt.getSortKey() == null || receipt.getSortKey().isEmpty()) {
                receipt.setReceiptId(receiptId); // This will set sortKey
            }
            receiptRepository.save(receipt);
            logger.debug("Created receipt: userId={}, receiptId={}, sortKey={}", 
                    userId, receiptId, receipt.getSortKey());
        }
        
        receipt.setStatus("processing");
        receipt.setS3KeyOriginal(request.s3Key());
        // Ensure sortKey is still set before saving
        if (receipt.getSortKey() == null || receipt.getSortKey().isEmpty()) {
            receipt.setReceiptId(receiptId);
        }
        receiptRepository.save(receipt);
        
        // For local development without AWS, skip Textract
        // In production, this would trigger async Textract processing
        // Process receipt asynchronously - TextractService will handle AWS errors gracefully
        new Thread(() -> {
            try {
                textractService.processReceipt(userId, request.s3Key());
            } catch (Exception e) {
                // If TextractService fails, ReceiptProcessingService should handle it
                logger.error("Error in receipt processing thread: {}", e.getMessage());
            }
        }).start();
        
        ReceiptResponse response = ReceiptResponse.fromReceipt(receipt);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all receipts for user
     */
    @GetMapping
    public ResponseEntity<List<ReceiptResponse>> getUserReceipts(
            @RequestAttribute("userId") String userId) {
        
        List<Receipt> receipts = receiptRepository.findAllByUserId(userId);
        List<ReceiptResponse> responses = receipts.stream()
                .map(ReceiptResponse::fromReceipt)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get single receipt by ID
     */
    @GetMapping("/{receiptId}")
    public ResponseEntity<ReceiptResponse> getReceipt(
            @RequestAttribute("userId") String userId,
            @PathVariable String receiptId) {
        
        Receipt receipt = receiptRepository.findById(userId, receiptId);
        if (receipt == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(ReceiptResponse.fromReceipt(receipt));
    }
    
    /**
     * Delete receipt
     */
    @DeleteMapping("/{receiptId}")
    public ResponseEntity<Void> deleteReceipt(
            @RequestAttribute("userId") String userId,
            @PathVariable String receiptId) {
        
        receiptRepository.delete(userId, receiptId);
        return ResponseEntity.noContent().build();
    }
    
    private String extractReceiptIdFromS3Key(String s3Key) {
        // s3Key format: receipts/{userId}/{receiptId}.{ext}
        String[] parts = s3Key.split("/");
        if (parts.length >= 3) {
            String filename = parts[parts.length - 1];
            int lastDot = filename.lastIndexOf('.');
            return lastDot > 0 ? filename.substring(0, lastDot) : filename;
        }
        return UUID.randomUUID().toString();
    }
}
