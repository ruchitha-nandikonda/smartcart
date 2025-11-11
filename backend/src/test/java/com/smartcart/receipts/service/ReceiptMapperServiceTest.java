package com.smartcart.receipts.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ReceiptMapperService
 */
class ReceiptMapperServiceTest {
    
    private ReceiptMapperService mapperService;
    
    @BeforeEach
    void setUp() {
        mapperService = new ReceiptMapperService();
    }
    
    @Test
    @DisplayName("Should match exact product names")
    void testExactMatch() {
        ProductMatchResult result = mapperService.mapToProductWithConfidence("milk");
        assertNotNull(result.canonicalProductId());
        assertEquals(1.0, result.confidence(), 0.01);
        assertEquals("exact", result.matchType());
    }
    
    @Test
    @DisplayName("Should match synonyms with high confidence")
    void testSynonymMatch() {
        ProductMatchResult result = mapperService.mapToProductWithConfidence("whole milk");
        assertNotNull(result.canonicalProductId());
        assertTrue(result.isConfident());
        assertEquals("synonym", result.matchType());
    }
    
    @Test
    @DisplayName("Should strip store noise words")
    void testStoreNoiseRemoval() {
        ProductMatchResult result = mapperService.mapToProductWithConfidence("MILK - CLUB PRICE SALE");
        assertNotNull(result.canonicalProductId());
        assertEquals("milk", result.canonicalProductId());
    }
    
    @Test
    @DisplayName("Should normalize size tokens")
    void testSizeNormalization() {
        ProductMatchResult result = mapperService.mapToProductWithConfidence("milk 16oz");
        assertNotNull(result.canonicalProductId());
        assertEquals("milk", result.canonicalProductId());
    }
    
    @Test
    @DisplayName("Should use Jaro-Winkler for fuzzy matching")
    void testFuzzyMatch() {
        ProductMatchResult result = mapperService.mapToProductWithConfidence("milkk"); // typo
        // Should still match milk with lower confidence
        assertNotNull(result.canonicalProductId());
        assertTrue(result.confidence() >= 0.70);
    }
    
    @Test
    @DisplayName("Should return no match for unknown products")
    void testNoMatch() {
        ProductMatchResult result = mapperService.mapToProductWithConfidence("xyz123 unknown product");
        assertNull(result.canonicalProductId());
        assertFalse(result.isConfident());
    }
}









