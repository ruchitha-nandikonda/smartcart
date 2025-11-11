package com.smartcart.receipts.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * File validation service for receipt uploads
 * Validates file type, size, and content
 */
@Service
public class FileValidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileValidationService.class);
    
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf"
    );
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".pdf"
    );
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    /**
     * Validate file type and size
     * @param file The uploaded file
     * @throws IllegalArgumentException if validation fails
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    String.format("Invalid file type: %s. Allowed types: %s", 
                            contentType, ALLOWED_CONTENT_TYPES));
        }
        
        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("Filename is null");
        }
        
        String extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    String.format("Invalid file extension: %s. Allowed extensions: %s", 
                            extension, ALLOWED_EXTENSIONS));
        }
        
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("File size %d exceeds maximum size of %d bytes", 
                            file.getSize(), MAX_FILE_SIZE));
        }
        
        logger.debug("File validation passed: {} ({} bytes, {})", 
                filename, file.getSize(), contentType);
    }
    
    /**
     * Validate content type string (for pre-signed URLs)
     */
    public void validateContentType(String contentType) {
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    String.format("Invalid content type: %s. Allowed types: %s", 
                            contentType, ALLOWED_CONTENT_TYPES));
        }
    }
}









