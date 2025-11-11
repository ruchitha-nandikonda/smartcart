package com.smartcart.receipts.service;

/**
 * Result of matching a receipt line item to a canonical product
 */
public record ProductMatchResult(
    String canonicalProductId,
    double confidence,
    String matchType // "exact", "synonym", "fuzzy"
) {
    public static ProductMatchResult noMatch() {
        return new ProductMatchResult(null, 0.0, "none");
    }
    
    public boolean isConfident() {
        return confidence >= 0.86;
    }
}









