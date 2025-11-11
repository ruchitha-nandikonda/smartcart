package com.smartcart.deals;

import com.smartcart.deals.dto.DealImportRequest;
import com.smartcart.deals.model.Deal;
import com.smartcart.deals.repository.DealRepository;
import com.smartcart.deals.service.DealImportScheduler;
import com.smartcart.deals.service.DealService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deals")
public class DealsController {
    
    private static final Logger logger = LoggerFactory.getLogger(DealsController.class);
    private final DealService dealService;
    private final DealImportScheduler dealImportScheduler;
    
    // Simple admin authentication for MVP (in production, use proper role-based auth)
    private static final String ADMIN_TOKEN = "admin-secret-token-change-in-production";
    
    public DealsController(DealService dealService, DealImportScheduler dealImportScheduler) {
        this.dealService = dealService;
        this.dealImportScheduler = dealImportScheduler;
    }
    
    @PostMapping("/admin/import")
    public ResponseEntity<Map<String, Object>> importDeals(
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @Valid @RequestBody DealImportRequest request) {
        
        // Simple admin authentication check
        if (adminToken == null || !adminToken.equals(ADMIN_TOKEN)) {
            logger.warn("Unauthorized admin import attempt");
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Unauthorized. Admin token required.");
            return ResponseEntity.status(401).body(error);
        }
        
        try {
            int importedCount = dealService.importDeals(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully imported " + importedCount + " deals");
            response.put("importedCount", importedCount);
            response.put("storeId", request.storeId());
            response.put("date", request.date());
            
            logger.info("Admin imported {} deals for store: {} on date: {}", 
                importedCount, request.storeName(), request.date());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error importing deals", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to import deals: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Deal>> getDeals(
            @RequestParam(required = false) String storeId,
            @RequestParam(required = false) String date) {
        
        try {
            List<Deal> deals;
            if (storeId != null && date != null) {
                deals = dealService.getDealsByStoreAndDate(storeId, date);
            } else if (storeId != null) {
                // Get deals for today
                String today = DealRepository.formatDateToday();
                deals = dealService.getDealsByStoreAndDate(storeId, today);
            } else if (date != null) {
                // Get deals for specific date across all stores
                deals = dealService.getDealsByDate(date);
            } else {
                deals = dealService.getAllDeals();
            }
            
            return ResponseEntity.ok(deals);
        } catch (Exception e) {
            logger.error("Error fetching deals", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping("/admin/trigger-import")
    public ResponseEntity<Map<String, Object>> triggerScheduledImport(
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken) {
        
        // Simple admin authentication check
        if (adminToken == null || !adminToken.equals(ADMIN_TOKEN)) {
            logger.warn("Unauthorized admin trigger import attempt");
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Unauthorized. Admin token required.");
            return ResponseEntity.status(401).body(error);
        }
        
        try {
            dealImportScheduler.triggerImport();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Scheduled import job triggered successfully");
            logger.info("Admin manually triggered deal import job");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error triggering scheduled import", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to trigger import: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

