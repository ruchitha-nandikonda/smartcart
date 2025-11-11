package com.smartcart.deals.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcart.deals.dto.DealImportRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Scheduled job to automatically import deals from JSON files
 * Runs daily at 2 AM to import new deals for the current day
 */
@Service
public class DealImportScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(DealImportScheduler.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    private final DealService dealService;
    private final ObjectMapper objectMapper;
    
    @Value("${deals.import.enabled:true}")
    private boolean importEnabled;
    
    @Value("${deals.import.path:src/main/resources/data/deals.comprehensive.json}")
    private String dealsFilePath;
    
    public DealImportScheduler(DealService dealService, ObjectMapper objectMapper) {
        this.dealService = dealService;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Scheduled job runs daily at 2:00 AM
     * Can be disabled by setting deals.import.enabled=false
     */
    @Scheduled(cron = "${deals.import.cron:0 0 2 * * *}")
    public void importDealsDaily() {
        if (!importEnabled) {
            logger.debug("Deal import scheduler is disabled");
            return;
        }
        
        logger.info("Starting scheduled deal import job");
        
        try {
            // Get today's date in YYYYMMDD format
            String today = LocalDate.now().format(DATE_FORMATTER);
            logger.info("Importing deals for date: {}", today);
            
            // Try to find deals file - check multiple locations
            Path dealsFile = findDealsFile();
            
            if (dealsFile == null || !Files.exists(dealsFile)) {
                logger.warn("Deals file not found at configured path: {}. Skipping import.", dealsFilePath);
                return;
            }
            
            // Read and parse JSON file
            DealImportRequest importRequest = objectMapper.readValue(dealsFile.toFile(), DealImportRequest.class);
            
            // Update date to today if it's different (deal service will handle this)
            if (!importRequest.date().equals(today)) {
                logger.info("Deal file has date {}, but importing for today: {}", importRequest.date(), today);
                // Create new request with today's date
                DealImportRequest updatedRequest = new DealImportRequest(
                    importRequest.storeId(),
                    importRequest.storeName(),
                    today, // Use today's date
                    importRequest.deals(),
                    importRequest.sourceUrl()
                );
                importRequest = updatedRequest;
            }
            
            // Import deals
            int importedCount = dealService.importDeals(importRequest);
            
            logger.info("Successfully imported {} deals for store: {} on date: {}", 
                importedCount, importRequest.storeName(), today);
                
        } catch (IOException e) {
            logger.error("Failed to read deals file: {}", e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error during scheduled deal import: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Find deals file in multiple possible locations
     */
    private Path findDealsFile() {
        // Try configured path first
        Path path = Paths.get(dealsFilePath);
        if (Files.exists(path)) {
            return path;
        }
        
        // Try relative to current working directory
        path = Paths.get(System.getProperty("user.dir"), dealsFilePath);
        if (Files.exists(path)) {
            return path;
        }
        
        // Try relative to backend directory
        path = Paths.get(System.getProperty("user.dir"), "backend", dealsFilePath);
        if (Files.exists(path)) {
            return path;
        }
        
        // Try in resources
        path = Paths.get(System.getProperty("user.dir"), "backend", "src", "main", "resources", "data", "deals.comprehensive.json");
        if (Files.exists(path)) {
            return path;
        }
        
        return null;
    }
    
    /**
     * Manual trigger for testing (can be exposed as admin endpoint if needed)
     */
    public void triggerImport() {
        logger.info("Manual deal import triggered");
        importDealsDaily();
    }
}

