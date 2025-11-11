package com.smartcart.receipts.service;

/**
 * String similarity algorithms for product matching
 */
public class StringSimilarity {
    
    private static final double JARO_WINKLER_PREFIX_SCALE = 0.1;
    private static final int JARO_WINKLER_MAX_PREFIX_LENGTH = 4;
    
    /**
     * Jaro-Winkler similarity (0.0 to 1.0)
     * Higher values indicate more similar strings
     */
    public static double jaroWinkler(String s1, String s2) {
        if (s1 == null || s2 == null) {
            return 0.0;
        }
        
        if (s1.equals(s2)) {
            return 1.0;
        }
        
        double jaro = jaro(s1, s2);
        
        // Winkler modification: boost similarity for strings with common prefix
        int prefixLength = commonPrefixLength(s1, s2);
        if (prefixLength > JARO_WINKLER_MAX_PREFIX_LENGTH) {
            prefixLength = JARO_WINKLER_MAX_PREFIX_LENGTH;
        }
        
        return jaro + (JARO_WINKLER_PREFIX_SCALE * prefixLength * (1.0 - jaro));
    }
    
    /**
     * Jaro similarity algorithm
     */
    private static double jaro(String s1, String s2) {
        if (s1.length() == 0 && s2.length() == 0) {
            return 1.0;
        }
        
        int matchWindow = Math.max(s1.length(), s2.length()) / 2 - 1;
        if (matchWindow < 0) {
            matchWindow = 0;
        }
        
        boolean[] s1Matches = new boolean[s1.length()];
        boolean[] s2Matches = new boolean[s2.length()];
        
        int matches = 0;
        int transpositions = 0;
        
        // Find matches
        for (int i = 0; i < s1.length(); i++) {
            int start = Math.max(0, i - matchWindow);
            int end = Math.min(i + matchWindow + 1, s2.length());
            
            for (int j = start; j < end; j++) {
                if (s2Matches[j] || s1.charAt(i) != s2.charAt(j)) {
                    continue;
                }
                s1Matches[i] = true;
                s2Matches[j] = true;
                matches++;
                break;
            }
        }
        
        if (matches == 0) {
            return 0.0;
        }
        
        // Find transpositions
        int k = 0;
        for (int i = 0; i < s1.length(); i++) {
            if (!s1Matches[i]) {
                continue;
            }
            while (!s2Matches[k]) {
                k++;
            }
            if (s1.charAt(i) != s2.charAt(k)) {
                transpositions++;
            }
            k++;
        }
        
        double jaroSimilarity = (
            (double) matches / s1.length() +
            (double) matches / s2.length() +
            (double) (matches - transpositions / 2.0) / matches
        ) / 3.0;
        
        return jaroSimilarity;
    }
    
    /**
     * Length of common prefix (up to max length)
     */
    private static int commonPrefixLength(String s1, String s2) {
        int maxLength = Math.min(Math.min(s1.length(), s2.length()), JARO_WINKLER_MAX_PREFIX_LENGTH);
        for (int i = 0; i < maxLength; i++) {
            if (s1.charAt(i) != s2.charAt(i)) {
                return i;
            }
        }
        return maxLength;
    }
}

