package com.smartcart.receipts.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for StringSimilarity (Jaro-Winkler)
 */
class StringSimilarityTest {
    
    @Test
    void testExactMatch() {
        double similarity = StringSimilarity.jaroWinkler("milk", "milk");
        assertEquals(1.0, similarity, 0.01);
    }
    
    @Test
    void testSimilarStrings() {
        double similarity = StringSimilarity.jaroWinkler("milk", "milkk");
        assertTrue(similarity > 0.85); // Should be high similarity
    }
    
    @Test
    void testDifferentStrings() {
        double similarity = StringSimilarity.jaroWinkler("milk", "bread");
        assertTrue(similarity < 0.5); // Should be low similarity
    }
    
    @Test
    void testPrefixBoost() {
        // Strings with common prefix should have higher similarity
        double withPrefix = StringSimilarity.jaroWinkler("milk", "milkchocolate");
        double withoutPrefix = StringSimilarity.jaroWinkler("milk", "chocolate");
        assertTrue(withPrefix > withoutPrefix);
    }
    
    @Test
    void testNullHandling() {
        assertEquals(0.0, StringSimilarity.jaroWinkler(null, "milk"));
        assertEquals(0.0, StringSimilarity.jaroWinkler("milk", null));
        assertEquals(0.0, StringSimilarity.jaroWinkler(null, null));
    }
}









