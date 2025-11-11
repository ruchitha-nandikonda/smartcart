package com.smartcart.receipts.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {
    
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;
    
    public S3Service(S3Client s3Client, S3Presigner s3Presigner, @Value("${aws.s3.bucket}") String bucketName) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
    }
    
    public PresignedUploadInfo generatePresignedUploadUrl(String userId, String contentType) {
        String receiptId = UUID.randomUUID().toString();
        String s3Key = String.format("receipts/%s/%s.%s", 
                userId, 
                receiptId,
                getFileExtension(contentType));
        
        // For local development without AWS, return a mock URL
        if (s3Presigner == null) {
            // Mock presigned URL for local development
            String mockUrl = String.format("http://localhost:8080/api/receipts/mock-upload/%s", s3Key);
            return new PresignedUploadInfo(mockUrl, s3Key, receiptId);
        }
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(contentType)
                .build();
        
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(putObjectRequest)
                .build();
        
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        
        return new PresignedUploadInfo(presignedRequest.url().toString(), s3Key, receiptId);
    }
    
    public record PresignedUploadInfo(String uploadUrl, String s3Key, String receiptId) {}
    
    public String getS3Key(String userId, String receiptId, String contentType) {
        return String.format("receipts/%s/%s.%s", 
                userId, 
                receiptId,
                getFileExtension(contentType));
    }
    
    private String getFileExtension(String contentType) {
        if (contentType == null) {
            return "jpg";
        }
        if (contentType.contains("pdf")) {
            return "pdf";
        }
        if (contentType.contains("png")) {
            return "png";
        }
        return "jpg"; // default
    }
    
    public void close() {
        if (s3Presigner != null) {
            s3Presigner.close();
        }
    }
}
