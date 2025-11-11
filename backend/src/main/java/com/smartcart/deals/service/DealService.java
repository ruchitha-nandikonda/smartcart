package com.smartcart.deals.service;

import com.smartcart.deals.dto.DealImportRequest;
import com.smartcart.deals.model.Deal;
import com.smartcart.deals.repository.DealRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DealService {
    
    private static final Logger logger = LoggerFactory.getLogger(DealService.class);
    private final DealRepository dealRepository;
    private static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    
    public DealService(DealRepository dealRepository) {
        this.dealRepository = dealRepository;
    }
    
    public int importDeals(DealImportRequest request) {
        logger.info("Importing deals for store: {} on date: {}", request.storeName(), request.date());
        
        List<Deal> deals = new ArrayList<>();
        
        for (DealImportRequest.DealItem item : request.deals()) {
            LocalDate promoEnds = null;
            if (item.promoEnds() != null && !item.promoEnds().isEmpty()) {
                try {
                    promoEnds = LocalDate.parse(item.promoEnds(), ISO_DATE_FORMATTER);
                } catch (Exception e) {
                    logger.warn("Invalid promoEnds date format: {}, skipping", item.promoEnds());
                }
            }
            
            // Use productId as the identifier, or generate from productName if not provided
            String productId = item.productId() != null && !item.productId().isEmpty() 
                ? item.productId() 
                : normalizeProductName(item.productName());
            
            Deal deal = new Deal(
                request.storeId(),
                request.date(),
                productId,
                request.storeName(),
                item.productName(),
                item.sizeText() != null ? item.sizeText() : "",
                item.unitPrice(),
                item.promoPrice() != null ? item.promoPrice() : item.unitPrice(),
                promoEnds,
                request.sourceUrl() != null ? request.sourceUrl() : ""
            );
            
            deals.add(deal);
        }
        
        // Delete existing deals for this store/date combination first
        dealRepository.deleteByStoreAndDate(request.storeId(), request.date());
        
        // Save new deals
        dealRepository.saveAll(deals);
        
        logger.info("Successfully imported {} deals for store: {} on date: {}", 
            deals.size(), request.storeName(), request.date());
        
        return deals.size();
    }
    
    public List<Deal> getDealsByStoreAndDate(String storeId, String date) {
        return dealRepository.findByStoreAndDate(storeId, date);
    }
    
    public List<Deal> getDealsByStoreAndDateRange(String storeId, String startDate, String endDate) {
        return dealRepository.findByStoreAndDateRange(storeId, startDate, endDate);
    }
    
    public List<Deal> getAllDeals() {
        return dealRepository.findAll();
    }
    
    public List<Deal> getDealsByDate(String date) {
        return dealRepository.findByDate(date);
    }
    
    private String normalizeProductName(String productName) {
        if (productName == null) {
            return "unknown";
        }
        // Simple normalization: lowercase, remove special chars, replace spaces with hyphens
        return productName.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .substring(0, Math.min(50, productName.length())); // Limit length
    }
}

