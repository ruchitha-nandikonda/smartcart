package com.smartcart.pantry.service;

import com.smartcart.pantry.dto.PantryItemDto;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for checking expiration dates and generating alerts
 */
@Service
public class ExpirationAlertService {
    
    private static final int DAYS_BEFORE_EXPIRY_TO_ALERT = 3;
    
    /**
     * Check if an item is expiring soon (within 3 days)
     */
    public boolean isExpiringSoon(PantryItemDto item) {
        if (item.estExpiry() == null || item.estExpiry().isEmpty()) {
            return false;
        }
        
        try {
            LocalDate expiryDate = parseExpiryDate(item.estExpiry());
            LocalDate today = LocalDate.now();
            LocalDate alertDate = today.plusDays(DAYS_BEFORE_EXPIRY_TO_ALERT);
            
            return !expiryDate.isAfter(alertDate);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if an item is expired
     */
    public boolean isExpired(PantryItemDto item) {
        if (item.estExpiry() == null || item.estExpiry().isEmpty()) {
            return false;
        }
        
        try {
            LocalDate expiryDate = parseExpiryDate(item.estExpiry());
            LocalDate today = LocalDate.now();
            
            return expiryDate.isBefore(today);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get expiration status message
     */
    public String getExpirationStatus(PantryItemDto item) {
        if (item.estExpiry() == null || item.estExpiry().isEmpty()) {
            return null;
        }
        
        try {
            LocalDate expiryDate = parseExpiryDate(item.estExpiry());
            LocalDate today = LocalDate.now();
            long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, expiryDate);
            
            if (daysUntilExpiry < 0) {
                return "Expired " + Math.abs(daysUntilExpiry) + " day(s) ago";
            } else if (daysUntilExpiry == 0) {
                return "Expires today";
            } else if (daysUntilExpiry <= DAYS_BEFORE_EXPIRY_TO_ALERT) {
                return "Expires in " + daysUntilExpiry + " day(s)";
            } else {
                return "Expires in " + daysUntilExpiry + " day(s)";
            }
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Filter items that are expiring soon or expired
     */
    public List<PantryItemDto> getExpiringItems(List<PantryItemDto> items) {
        List<PantryItemDto> expiring = new ArrayList<>();
        for (PantryItemDto item : items) {
            if (isExpiringSoon(item) || isExpired(item)) {
                expiring.add(item);
            }
        }
        return expiring;
    }
    
    private LocalDate parseExpiryDate(String expiryStr) {
        // Try ISO date format first (YYYY-MM-DD)
        try {
            return LocalDate.parse(expiryStr, DateTimeFormatter.ISO_DATE);
        } catch (DateTimeParseException e) {
            // Try timestamp format
            try {
                long timestamp = Long.parseLong(expiryStr);
                return Instant.ofEpochMilli(timestamp).atZone(ZoneId.systemDefault()).toLocalDate();
            } catch (NumberFormatException e2) {
                // Try common date formats
                String[] formats = {
                    "MM/dd/yyyy", "MM-dd-yyyy", "yyyy/MM/dd",
                    "dd/MM/yyyy", "dd-MM-yyyy"
                };
                for (String format : formats) {
                    try {
                        return LocalDate.parse(expiryStr, DateTimeFormatter.ofPattern(format));
                    } catch (DateTimeParseException ignored) {
                    }
                }
                throw new IllegalArgumentException("Unable to parse expiry date: " + expiryStr);
            }
        }
    }
}

