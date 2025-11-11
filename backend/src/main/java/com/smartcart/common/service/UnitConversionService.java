package com.smartcart.common.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Handles unit conversions for pantry matching
 * Converts between different units (e.g., cups to lbs, oz to grams)
 */
@Service
public class UnitConversionService {
    
    // Conversion factors to base unit (grams for weight, milliliters for volume)
    private static final Map<String, Double> WEIGHT_CONVERSIONS = new HashMap<>();
    private static final Map<String, Double> VOLUME_CONVERSIONS = new HashMap<>();
    
    static {
        // Weight conversions (to grams)
        WEIGHT_CONVERSIONS.put("g", 1.0);
        WEIGHT_CONVERSIONS.put("gram", 1.0);
        WEIGHT_CONVERSIONS.put("grams", 1.0);
        WEIGHT_CONVERSIONS.put("kg", 1000.0);
        WEIGHT_CONVERSIONS.put("kilogram", 1000.0);
        WEIGHT_CONVERSIONS.put("kilograms", 1000.0);
        WEIGHT_CONVERSIONS.put("oz", 28.35);
        WEIGHT_CONVERSIONS.put("ounce", 28.35);
        WEIGHT_CONVERSIONS.put("ounces", 28.35);
        WEIGHT_CONVERSIONS.put("lb", 453.6);
        WEIGHT_CONVERSIONS.put("lbs", 453.6);
        WEIGHT_CONVERSIONS.put("pound", 453.6);
        WEIGHT_CONVERSIONS.put("pounds", 453.6);
        
        // Volume conversions (to milliliters)
        VOLUME_CONVERSIONS.put("ml", 1.0);
        VOLUME_CONVERSIONS.put("milliliter", 1.0);
        VOLUME_CONVERSIONS.put("milliliters", 1.0);
        VOLUME_CONVERSIONS.put("l", 1000.0);
        VOLUME_CONVERSIONS.put("liter", 1000.0);
        VOLUME_CONVERSIONS.put("liters", 1000.0);
        VOLUME_CONVERSIONS.put("fl oz", 29.57);
        VOLUME_CONVERSIONS.put("fluid ounce", 29.57);
        VOLUME_CONVERSIONS.put("fluid ounces", 29.57);
        VOLUME_CONVERSIONS.put("cup", 236.59);
        VOLUME_CONVERSIONS.put("cups", 236.59);
        VOLUME_CONVERSIONS.put("pt", 473.18);
        VOLUME_CONVERSIONS.put("pint", 473.18);
        VOLUME_CONVERSIONS.put("pints", 473.18);
        VOLUME_CONVERSIONS.put("qt", 946.35);
        VOLUME_CONVERSIONS.put("quart", 946.35);
        VOLUME_CONVERSIONS.put("quarts", 946.35);
        VOLUME_CONVERSIONS.put("gal", 3785.41);
        VOLUME_CONVERSIONS.put("gallon", 3785.41);
        VOLUME_CONVERSIONS.put("gallons", 3785.41);
        VOLUME_CONVERSIONS.put("tbsp", 14.79);
        VOLUME_CONVERSIONS.put("tablespoon", 14.79);
        VOLUME_CONVERSIONS.put("tablespoons", 14.79);
        VOLUME_CONVERSIONS.put("tsp", 4.93);
        VOLUME_CONVERSIONS.put("teaspoon", 4.93);
        VOLUME_CONVERSIONS.put("teaspoons", 4.93);
    }
    
    /**
     * Convert a quantity from one unit to another
     * Returns null if conversion is not possible
     */
    public Double convert(Double quantity, String fromUnit, String toUnit) {
        if (quantity == null || fromUnit == null || toUnit == null) {
            return null;
        }
        
        String fromUnitLower = fromUnit.toLowerCase().trim();
        String toUnitLower = toUnit.toLowerCase().trim();
        
        // If units are the same, no conversion needed
        if (fromUnitLower.equals(toUnitLower)) {
            return quantity;
        }
        
        // Check if both are weight units
        if (isWeightUnit(fromUnitLower) && isWeightUnit(toUnitLower)) {
            return convertWeight(quantity, fromUnitLower, toUnitLower);
        }
        
        // Check if both are volume units
        if (isVolumeUnit(fromUnitLower) && isVolumeUnit(toUnitLower)) {
            return convertVolume(quantity, fromUnitLower, toUnitLower);
        }
        
        // Special case: approximate conversions between weight and volume for common items
        // This is approximate and product-specific, but useful for pantry matching
        if (isWeightUnit(fromUnitLower) && isVolumeUnit(toUnitLower)) {
            return approximateWeightToVolume(quantity, fromUnitLower, toUnitLower);
        }
        
        if (isVolumeUnit(fromUnitLower) && isWeightUnit(toUnitLower)) {
            return approximateVolumeToWeight(quantity, fromUnitLower, toUnitLower);
        }
        
        // No conversion possible
        return null;
    }
    
    /**
     * Check if units are compatible (same type)
     */
    public boolean areCompatible(String unit1, String unit2) {
        if (unit1 == null || unit2 == null) {
            return false;
        }
        
        String unit1Lower = unit1.toLowerCase().trim();
        String unit2Lower = unit2.toLowerCase().trim();
        
        if (unit1Lower.equals(unit2Lower)) {
            return true;
        }
        
        return (isWeightUnit(unit1Lower) && isWeightUnit(unit2Lower)) ||
               (isVolumeUnit(unit1Lower) && isVolumeUnit(unit2Lower)) ||
               (isCountUnit(unit1Lower) && isCountUnit(unit2Lower));
    }
    
    private boolean isWeightUnit(String unit) {
        return WEIGHT_CONVERSIONS.containsKey(unit);
    }
    
    private boolean isVolumeUnit(String unit) {
        return VOLUME_CONVERSIONS.containsKey(unit);
    }
    
    private boolean isCountUnit(String unit) {
        return unit.equals("count") || unit.equals("counts") || unit.equals("unit") || unit.equals("units") ||
               unit.equals("piece") || unit.equals("pieces") || unit.equals("item") || unit.equals("items");
    }
    
    private Double convertWeight(Double quantity, String fromUnit, String toUnit) {
        Double fromFactor = WEIGHT_CONVERSIONS.get(fromUnit);
        Double toFactor = WEIGHT_CONVERSIONS.get(toUnit);
        
        if (fromFactor == null || toFactor == null) {
            return null;
        }
        
        // Convert to grams, then to target unit
        double grams = quantity * fromFactor;
        return grams / toFactor;
    }
    
    private Double convertVolume(Double quantity, String fromUnit, String toUnit) {
        Double fromFactor = VOLUME_CONVERSIONS.get(fromUnit);
        Double toFactor = VOLUME_CONVERSIONS.get(toUnit);
        
        if (fromFactor == null || toFactor == null) {
            return null;
        }
        
        // Convert to milliliters, then to target unit
        double milliliters = quantity * fromFactor;
        return milliliters / toFactor;
    }
    
    /**
     * Approximate weight to volume conversion (product-specific approximations)
     * This is approximate and may not be accurate for all products
     */
    private Double approximateWeightToVolume(Double quantity, String fromUnit, String toUnit) {
        // Common approximations (these are rough estimates)
        // For water: 1g ≈ 1ml, but for other products this varies
        
        // Convert weight to grams first
        Double fromFactor = WEIGHT_CONVERSIONS.get(fromUnit);
        if (fromFactor == null) return null;
        double grams = quantity * fromFactor;
        
        // Approximate: assume density similar to water (1g/ml) for most liquids
        // For solids, this is more approximate
        double milliliters = grams; // Rough approximation
        
        // Convert to target volume unit
        Double toFactor = VOLUME_CONVERSIONS.get(toUnit);
        if (toFactor == null) return null;
        return milliliters / toFactor;
    }
    
    /**
     * Approximate volume to weight conversion
     */
    private Double approximateVolumeToWeight(Double quantity, String fromUnit, String toUnit) {
        // Convert volume to milliliters first
        Double fromFactor = VOLUME_CONVERSIONS.get(fromUnit);
        if (fromFactor == null) return null;
        double milliliters = quantity * fromFactor;
        
        // Approximate: assume density similar to water (1ml ≈ 1g)
        double grams = milliliters; // Rough approximation
        
        // Convert to target weight unit
        Double toFactor = WEIGHT_CONVERSIONS.get(toUnit);
        if (toFactor == null) return null;
        return grams / toFactor;
    }
}

