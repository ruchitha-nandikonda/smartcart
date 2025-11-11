package com.smartcart.deals.repository;

import com.smartcart.deals.model.Deal;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class DealRepository {
    
    private final DynamoDbTable<Deal> dealTable;
    private static final String TABLE_NAME = "Deals";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    @Autowired
    public DealRepository(DynamoDbEnhancedClient enhancedClient) {
        this.dealTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(Deal.class));
    }
    
    public void save(Deal deal) {
        // Ensure composite keys are set
        if (deal.getStoreIdDate() == null && deal.getStoreId() != null && deal.getDate() != null) {
            deal.setStoreIdDate(deal.getStoreId() + "#" + deal.getDate());
        }
        if (deal.getProductId() != null && !deal.getProductId().startsWith("PRODUCT#")) {
            deal.setProductId("PRODUCT#" + deal.getProductId());
        }
        dealTable.putItem(deal);
    }
    
    public void saveAll(List<Deal> deals) {
        deals.forEach(this::save);
    }
    
    public List<Deal> findByStoreAndDate(String storeId, String date) {
        String partitionKey = storeId + "#" + date;
        Key key = Key.builder()
                .partitionValue(partitionKey)
                .build();
        
        return dealTable.query(QueryConditional.keyEqualTo(key))
                .items()
                .stream()
                .collect(Collectors.toList());
    }
    
    public List<Deal> findByStoreAndDateRange(String storeId, String startDate, String endDate) {
        // For date range queries, we need to query each date separately
        // since partition key includes date
        List<Deal> allDeals = new ArrayList<>();
        // Simple implementation: query each date in range
        // In production, consider using GSI or batch queries
        String partitionKey = storeId + "#" + startDate;
        Key key = Key.builder()
                .partitionValue(partitionKey)
                .build();
        
        return dealTable.query(QueryConditional.keyEqualTo(key))
                .items()
                .stream()
                .collect(Collectors.toList());
    }
    
    public List<Deal> findAll() {
        return dealTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .collect(Collectors.toList());
    }
    
    public List<Deal> findByDate(String date) {
        // Since date is part of the partition key (storeId#date), we need to scan and filter
        // In production, consider using a GSI on date field for better performance
        List<Deal> allDeals = dealTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .collect(Collectors.toList());
        
        return allDeals.stream()
                .filter(deal -> {
                    String dealDate = deal.getDate();
                    // If deal date is null, check if we can extract it from storeIdDate
                    if (dealDate == null || dealDate.isEmpty()) {
                        String storeIdDate = deal.getStoreIdDate();
                        if (storeIdDate != null && storeIdDate.contains("#")) {
                            String[] parts = storeIdDate.split("#");
                            if (parts.length >= 2) {
                                dealDate = parts[1];
                            }
                        }
                    }
                    return date != null && date.equals(dealDate);
                })
                .collect(Collectors.toList());
    }
    
    public void deleteByStoreAndDate(String storeId, String date) {
        List<Deal> deals = findByStoreAndDate(storeId, date);
        deals.forEach(deal -> {
            Key key = Key.builder()
                    .partitionValue(deal.getStoreIdDate())
                    .sortValue(deal.getProductId())
                    .build();
            dealTable.deleteItem(key);
        });
    }
    
    public static String formatDate(LocalDate date) {
        return date.format(DATE_FORMATTER);
    }
    
    public static String formatDateToday() {
        return LocalDate.now().format(DATE_FORMATTER);
    }
}

