package com.smartcart.optimize.service;

import com.smartcart.deals.model.Deal;
import com.smartcart.deals.repository.DealRepository;
import com.smartcart.optimize.dto.*;
import com.smartcart.pantry.dto.PantryItemDto;
import com.smartcart.pantry.service.PantryService;
import com.smartcart.common.service.UnitConversionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Shopping list optimizer service
 * Optimizes shopping list based on pantry items and deals
 */
@Service
public class OptimizerService {
    
    private static final Logger logger = LoggerFactory.getLogger(OptimizerService.class);
    
    private final MealCatalogService mealCatalogService;
    private final PantryService pantryService;
    private final UnitConversionService unitConversionService;
    private final DealRepository dealRepository;
    
    // Fallback mock deals if no real deals found in database
    private static final Map<String, Map<String, Double>> FALLBACK_DEALS = Map.of(
        "Walmart", Map.of(
            "Chicken Breast", 5.99,
            "Ground Beef", 4.99,
            "Salmon", 8.99,
            "Eggs", 2.99,
            "Milk", 3.49,
            "Rice", 3.99,
            "Bread", 2.49
        ),
        "Target", Map.of(
            "Chicken Breast", 6.49,
            "Ground Beef", 5.49,
            "Salmon", 9.99,
            "Eggs", 3.49,
            "Milk", 3.99,
            "Rice", 4.49,
            "Bread", 2.99
        ),
        "Kroger", Map.of(
            "Chicken Breast", 5.49,
            "Ground Beef", 4.49,
            "Salmon", 8.49,
            "Eggs", 2.49,
            "Milk", 3.29,
            "Rice", 3.49,
            "Bread", 2.29
        )
    );
    
    public OptimizerService(MealCatalogService mealCatalogService, PantryService pantryService,
                           UnitConversionService unitConversionService, DealRepository dealRepository) {
        this.mealCatalogService = mealCatalogService;
        this.pantryService = pantryService;
        this.unitConversionService = unitConversionService;
        this.dealRepository = dealRepository;
    }
    
    /**
     * Get current deals from database, falling back to mock data if none found
     * Returns map of store -> product -> DealInfo (price, originalPrice, hasPromo)
     */
    private static class DealInfo {
        double price;
        Double originalPrice;
        boolean hasPromo;
        
        DealInfo(double price, Double originalPrice, boolean hasPromo) {
            this.price = price;
            this.originalPrice = originalPrice;
            this.hasPromo = hasPromo;
        }
    }
    
    private Map<String, Map<String, DealInfo>> getCurrentDealsWithInfo() {
        try {
            String today = DealRepository.formatDateToday();
            List<Deal> deals = dealRepository.findAll();
            
            // Filter to today's deals or use all if none for today
            List<Deal> todayDeals = deals.stream()
                    .filter(d -> d.getDate().equals(today))
                    .collect(Collectors.toList());
            
            if (todayDeals.isEmpty() && !deals.isEmpty()) {
                // Use most recent deals if no deals for today
                todayDeals = deals;
            }
            
            if (!todayDeals.isEmpty()) {
                // Build deals map from database with deal info
                Map<String, Map<String, DealInfo>> dealsMap = new HashMap<>();
                for (Deal deal : todayDeals) {
                    String storeId = deal.getStoreId();
                    String productName = deal.getProductName();
                    Double promoPrice = deal.getPromoPrice();
                    Double unitPrice = deal.getUnitPrice();
                    boolean hasPromo = promoPrice != null && promoPrice < unitPrice;
                    Double price = hasPromo ? promoPrice : unitPrice;
                    Double originalPrice = hasPromo ? unitPrice : null;
                    
                    // Store both exact name and normalized name for better matching
                    Map<String, DealInfo> storeDeals = dealsMap.computeIfAbsent(storeId, k -> new HashMap<>());
                    storeDeals.put(productName, new DealInfo(price, originalPrice, hasPromo));
                    // Also store normalized version for case-insensitive matching
                    String normalizedName = normalizeIngredientName(productName);
                    String productNameLower = productName.toLowerCase().trim();
                    // Store normalized version if different from lowercase
                    if (!normalizedName.equals(productNameLower)) {
                        storeDeals.put(normalizedName, new DealInfo(price, originalPrice, hasPromo));
                    }
                    // Always store lowercase version for matching
                    if (!productNameLower.equals(productName)) {
                        storeDeals.put(productNameLower, new DealInfo(price, originalPrice, hasPromo));
                    }
                }
                logger.info("Loaded {} deals from database for {} stores", todayDeals.size(), dealsMap.size());
                logger.debug("Sample deal products: {}", 
                    dealsMap.values().stream()
                        .flatMap(storeDeals -> storeDeals.keySet().stream())
                        .limit(10)
                        .collect(Collectors.joining(", ")));
                return dealsMap;
            } else {
                logger.debug("No deals found in database, using fallback mock data");
                return convertFallbackDeals();
            }
        } catch (Exception e) {
            logger.warn("Error loading deals from database, using fallback: {}", e.getMessage());
            return convertFallbackDeals();
        }
    }
    
    private Map<String, Map<String, DealInfo>> convertFallbackDeals() {
        Map<String, Map<String, DealInfo>> result = new HashMap<>();
        for (Map.Entry<String, Map<String, Double>> storeEntry : FALLBACK_DEALS.entrySet()) {
            Map<String, DealInfo> storeDeals = new HashMap<>();
            for (Map.Entry<String, Double> productEntry : storeEntry.getValue().entrySet()) {
                // Fallback deals are treated as promo prices with no original price
                storeDeals.put(productEntry.getKey(), 
                    new DealInfo(productEntry.getValue(), null, false));
            }
            result.put(storeEntry.getKey(), storeDeals);
        }
        return result;
    }
    
    public OptimizeResponse optimize(String userId, OptimizeRequest request) {
        // Get all required ingredients from selected meals, multiplied by servings
        Map<String, Double> requiredIngredients = new HashMap<>();
        logger.info("Optimizing shopping list for meals: {}", request.mealServings().keySet());
        for (Map.Entry<String, Integer> entry : request.mealServings().entrySet()) {
            String mealId = entry.getKey();
            Integer servings = entry.getValue();
            double multiplier = servings != null && servings > 0 ? servings : 1.0;
            
            Map<String, Double> mealIngredients = mealCatalogService.getMealIngredients(mealId);
            if (mealIngredients.isEmpty()) {
                logger.warn("No ingredients found for meal: {}", mealId);
            } else {
                logger.info("Meal '{}' ({} servings) requires: {}", mealId, servings, mealIngredients);
            }
            mealIngredients.forEach((ingredient, qty) -> {
                double scaledQty = qty * multiplier;
                requiredIngredients.merge(ingredient, scaledQty, Double::sum);
            });
        }
        logger.info("Total required ingredients (after combining): {}", requiredIngredients);
        
        // Get user's pantry items
        List<PantryItemDto> pantryItems = pantryService.getAllByUserId(userId);
        // Create case-insensitive and normalized pantry map for better matching
        Map<String, PantryItemDto> pantryMap = new HashMap<>();
        Map<String, PantryItemDto> pantryMapNormalized = new HashMap<>();
        for (PantryItemDto item : pantryItems) {
            pantryMap.put(item.name(), item);
            // Also store normalized versions for fuzzy matching
            String normalized = normalizeIngredientName(item.name());
            pantryMapNormalized.put(normalized, item);
            // Store case-insensitive version
            pantryMapNormalized.put(item.name().toLowerCase(), item);
        }
        
        // Check what can be satisfied from pantry
        List<String> usesPantry = new ArrayList<>();
        Map<String, Double> shoppingNeeds = new HashMap<>();
        
        for (Map.Entry<String, Double> entry : requiredIngredients.entrySet()) {
            String ingredient = entry.getKey();
            Double needed = entry.getValue();
            
            // Try exact match first
            PantryItemDto pantryItem = pantryMap.get(ingredient);
            
            // Try case-insensitive match
            if (pantryItem == null) {
                pantryItem = pantryMapNormalized.get(ingredient.toLowerCase());
            }
            
            // Try normalized/fuzzy match
            if (pantryItem == null) {
                String normalizedIngredient = normalizeIngredientName(ingredient);
                pantryItem = pantryMapNormalized.get(normalizedIngredient);
            }
            
            // Try partial matching (e.g., "Milk" matches "Whole Milk")
            if (pantryItem == null) {
                pantryItem = findPartialMatch(ingredient, pantryItems);
            }
            
            // Additional check: if ingredient contains "bread" (case-insensitive), try matching any pantry item with "bread" in name
            // Also handles reverse: if pantry has "Rye Bread" and ingredient is "Bread", they should match
            if (pantryItem == null) {
                String ingredientLower = ingredient.toLowerCase();
                boolean ingredientIsBread = ingredientLower.contains("bread");
                
                for (PantryItemDto item : pantryItems) {
                    String pantryNameLower = item.name().toLowerCase();
                    boolean pantryIsBread = pantryNameLower.contains("bread");
                    
                    // Match if both contain "bread" (handles "Bread" <-> "Rye Bread", "White Bread", etc.)
                    if (ingredientIsBread && pantryIsBread) {
                        pantryItem = item;
                        logger.debug("Matched bread via keyword search: ingredient='{}' matched pantry item='{}'", 
                            ingredient, item.name());
                        break;
                    }
                }
            }
            
            if (pantryItem != null) {
                // Try to convert units if needed
                Double pantryQty = pantryItem.quantity();
                String pantryUnit = pantryItem.unit() != null ? pantryItem.unit() : "unit";
                String neededUnit = getUnitForProduct(ingredient);
                
                // Special handling for bread and other count-based items
                // If both are count-like units (unit, count, loaf, slice, etc.), treat as compatible
                boolean isCountLike = isCountLikeUnit(pantryUnit) && isCountLikeUnit(neededUnit);
                
                // If units are different, try conversion
                if (!pantryUnit.equalsIgnoreCase(neededUnit)) {
                    if (isCountLike) {
                        // For count-like units, use quantity as-is (1 loaf = 1 unit, etc.)
                        // This is a simplification - in reality, 1 loaf might = 20 slices
                        // But for pantry matching, we'll assume user has enough if they have any bread
                        logger.debug("Matching count-like units: pantry={} ({}), needed={} ({})", 
                            pantryItem.name(), pantryQty, ingredient, needed);
                    } else if (unitConversionService.areCompatible(pantryUnit, neededUnit)) {
                        Double convertedQty = unitConversionService.convert(pantryQty, pantryUnit, neededUnit);
                        if (convertedQty != null) {
                            pantryQty = convertedQty;
                        }
                    }
                }
                
                // For bread and other count items, if we have any quantity, consider it sufficient
                // (user can use part of a loaf, etc.)
                boolean hasEnough;
                String ingredientLower = ingredient.toLowerCase();
                if (isCountLike) {
                    // Treat count-like items (eggs, bread, buns, etc.) as satisfied if the user has at least one on hand.
                    hasEnough = pantryQty >= needed || pantryQty >= 1;
                    if (ingredientLower.contains("bread")) {
                        logger.debug("Bread matching: ingredient={}, pantry={} ({} {}), needed={}, hasEnough={}", 
                            ingredient, pantryItem.name(), pantryQty, pantryUnit, needed, hasEnough);
                    }
                } else {
                    hasEnough = pantryQty >= needed;
                }
                
                if (hasEnough) {
                    String displayName = pantryItem.name() != null ? pantryItem.name() : ingredient;
                    if (!usesPantry.contains(displayName)) {
                        usesPantry.add(displayName);
                    }
                    logger.debug("Using {} from pantry: {} (have {}, need {})", 
                        ingredient, pantryItem.name(), pantryQty, needed);
                    continue;
                } else {
                    double stillNeeded = Math.max(0, needed - pantryQty);
                    if (stillNeeded > 0) {
                        shoppingNeeds.put(ingredient, stillNeeded);
                        logger.debug("Need to buy {}: have {}, need {}, still need {}", 
                            ingredient, pantryQty, needed, stillNeeded);
                    } else {
                        logger.debug("Have enough {} in pantry: have {}, need {}", 
                            ingredient, pantryQty, needed);
                    }
                }
            } else {
                // No pantry item found, need full amount
                shoppingNeeds.put(ingredient, needed);
            }
        }
        
        // Optimize shopping list with deals
        List<ShoppingItem> shoppingList = new ArrayList<>();
        Map<String, Double> costByStore = new HashMap<>();
        List<String> notes = new ArrayList<>();
        int dealsFoundCount = 0;
        int promoDealsCount = 0;
        double totalSavings = 0.0;
        Map<String, Integer> itemsByStore = new HashMap<>();
        
        // Get current deals from database with deal info
        Map<String, Map<String, DealInfo>> deals = getCurrentDealsWithInfo();
        
        for (Map.Entry<String, Double> entry : shoppingNeeds.entrySet()) {
            String product = entry.getKey();
            Double qty = entry.getValue();
            
            // Find best store/price for this product
            String bestStore = null;
            DealInfo bestDealInfo = null;
            boolean dealFound = false;
            
            String productLower = product.toLowerCase().trim();
            String productNormalized = normalizeIngredientName(product);
            
            // Try exact match first (case-sensitive)
            for (Map.Entry<String, Map<String, DealInfo>> storeEntry : deals.entrySet()) {
                String store = storeEntry.getKey();
                Map<String, DealInfo> storeDeals = storeEntry.getValue();
                
                if (storeDeals.containsKey(product)) {
                    DealInfo dealInfo = storeDeals.get(product);
                    if (bestDealInfo == null || dealInfo.price < bestDealInfo.price) {
                        bestDealInfo = dealInfo;
                        bestStore = store;
                        dealFound = true;
                    }
                }
            }
            
            // Try normalized match
            if (!dealFound) {
                for (Map.Entry<String, Map<String, DealInfo>> storeEntry : deals.entrySet()) {
                    String store = storeEntry.getKey();
                    Map<String, DealInfo> storeDeals = storeEntry.getValue();
                    
                    if (storeDeals.containsKey(productNormalized)) {
                        DealInfo dealInfo = storeDeals.get(productNormalized);
                        if (bestDealInfo == null || dealInfo.price < bestDealInfo.price) {
                            bestDealInfo = dealInfo;
                            bestStore = store;
                            dealFound = true;
                        }
                    }
                }
            }
            
            // If no exact match, try case-insensitive match
            if (!dealFound) {
                for (Map.Entry<String, Map<String, DealInfo>> storeEntry : deals.entrySet()) {
                    String store = storeEntry.getKey();
                    Map<String, DealInfo> storeDeals = storeEntry.getValue();
                    
                    for (Map.Entry<String, DealInfo> dealEntry : storeDeals.entrySet()) {
                        String dealProduct = dealEntry.getKey();
                        String dealProductLower = dealProduct.toLowerCase().trim();
                        String dealProductNormalized = normalizeIngredientName(dealProduct);
                        
                        // Try exact lowercase match
                        if (dealProductLower.equals(productLower)) {
                            DealInfo dealInfo = dealEntry.getValue();
                            if (bestDealInfo == null || dealInfo.price < bestDealInfo.price) {
                                bestDealInfo = dealInfo;
                                bestStore = store;
                                dealFound = true;
                            }
                        }
                        // Try normalized match
                        else if (dealProductNormalized.equals(productNormalized)) {
                            DealInfo dealInfo = dealEntry.getValue();
                            if (bestDealInfo == null || dealInfo.price < bestDealInfo.price) {
                                bestDealInfo = dealInfo;
                                bestStore = store;
                                dealFound = true;
                            }
                        }
                        // Also try matching plural/singular variations
                        else if ((productLower + "s").equals(dealProductLower) || 
                                 productLower.equals(dealProductLower + "s") ||
                                 (productLower.endsWith("s") && productLower.substring(0, productLower.length() - 1).equals(dealProductLower)) ||
                                 (dealProductLower.endsWith("s") && dealProductLower.substring(0, dealProductLower.length() - 1).equals(productLower))) {
                            DealInfo dealInfo = dealEntry.getValue();
                            if (bestDealInfo == null || dealInfo.price < bestDealInfo.price) {
                                bestDealInfo = dealInfo;
                                bestStore = store;
                                dealFound = true;
                            }
                        }
                    }
                }
            }
            
            // If still no match, try partial matching with word-level matching
            if (!dealFound) {
                for (Map.Entry<String, Map<String, DealInfo>> storeEntry : deals.entrySet()) {
                    String store = storeEntry.getKey();
                    Map<String, DealInfo> storeDeals = storeEntry.getValue();
                    
                    for (Map.Entry<String, DealInfo> dealEntry : storeDeals.entrySet()) {
                        String dealProduct = dealEntry.getKey().toLowerCase().trim();
                        
                        // Check if product name contains deal product or vice versa (handles single words like "Butter")
                        if (dealProduct.equals(productLower) || 
                            dealProduct.contains(productLower) || 
                            productLower.contains(dealProduct)) {
                            DealInfo dealInfo = dealEntry.getValue();
                            if (bestDealInfo == null || dealInfo.price < bestDealInfo.price) {
                                bestDealInfo = dealInfo;
                                bestStore = store;
                                dealFound = true;
                            }
                        } else {
                            // Word-level matching: "Cheddar Cheese" should match "Cheese"
                            String[] productWords = productLower.split("\\s+");
                            String[] dealWords = dealProduct.split("\\s+");
                            
                            // Check if any word from product matches any word from deal
                            for (String productWord : productWords) {
                                for (String dealWord : dealWords) {
                                    if (productWord.equals(dealWord) && productWord.length() > 2) {
                                        // Found matching word (minimum 3 chars to avoid matching common words)
                                        DealInfo dealInfo = dealEntry.getValue();
                                        if (bestDealInfo == null || dealInfo.price < bestDealInfo.price) {
                                            bestDealInfo = dealInfo;
                                            bestStore = store;
                                            dealFound = true;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // If no deal found, use default price and store
            if (!dealFound) {
                bestStore = "walmart"; // Default store (normalized to lowercase)
                bestDealInfo = new DealInfo(5.0, null, false); // Default price
                // Only add note if we actually searched (don't spam notes)
                logger.warn("No deal found for product: '{}' (searched in {} stores). Available products: {}", 
                    product, deals.size(), 
                    deals.values().stream()
                        .flatMap(storeDeals -> storeDeals.keySet().stream())
                        .limit(10)
                        .collect(java.util.stream.Collectors.joining(", ")));
                // Don't add note for every missing item - it's too noisy
                // notes.add(String.format("%s: No deal found, using default price", product));
            } else {
                logger.debug("Found deal for product: {} at store: {} with price: {} (hasPromo: {})", 
                    product, bestStore, bestDealInfo.price, bestDealInfo.hasPromo);
            }
            
            // Normalize store name for consistency (capitalize first letter)
            bestStore = normalizeStoreName(bestStore);
            
            // Calculate deal information
            Double originalPrice = bestDealInfo.originalPrice != null 
                ? bestDealInfo.originalPrice * qty 
                : null;
            Double savings = bestDealInfo.hasPromo && bestDealInfo.originalPrice != null
                ? (bestDealInfo.originalPrice - bestDealInfo.price) * qty
                : null;
            // hasDeal is true if a deal was found (even without promo, to show deal tag)
            // But we'll show promo badge only if hasPromo is true
            boolean hasDeal = dealFound;
            
            // Track statistics
            if (dealFound) {
                dealsFoundCount++;
                if (bestDealInfo.hasPromo) {
                    promoDealsCount++;
                }
            }
            
            // Track savings
            if (savings != null && savings > 0) {
                totalSavings += savings;
            }
            
            // Track items per store
            itemsByStore.merge(bestStore, 1, Integer::sum);
            
            shoppingList.add(new ShoppingItem(
                product,
                qty,
                getUnitForProduct(product),
                bestStore,
                bestDealInfo.price * qty,
                originalPrice,
                savings,
                hasDeal
            ));
            
            costByStore.merge(bestStore, bestDealInfo.price * qty, Double::sum);
        }
        
        // Calculate total cost
        double totalCost = costByStore.values().stream().mapToDouble(Double::doubleValue).sum();
        
        // Count items without deals
        int itemsWithoutDeals = shoppingNeeds.size() - dealsFoundCount;
        
        // Always add basic insights if we have items
        if (shoppingNeeds.size() > 0) {
            // Add pantry usage note
            if (!usesPantry.isEmpty()) {
                notes.add(String.format("📦 Using %d item(s) from pantry - saving money!", usesPantry.size()));
            }
            
            // Add total savings insight (always show if there are any savings)
            if (totalSavings > 0) {
                double savingsPercent = (totalSavings / (totalCost + totalSavings)) * 100;
                notes.add(String.format("💰 Total savings: $%.2f (%.1f%% off regular prices)", 
                    totalSavings, savingsPercent));
            }
            
            // Add deal summary (always show status)
            if (promoDealsCount == shoppingNeeds.size()) {
                notes.add(String.format("🎉 All %d items have promotional deals!", promoDealsCount));
            } else if (promoDealsCount > 0) {
                notes.add(String.format("✅ %d out of %d items have promotional deals", promoDealsCount, shoppingNeeds.size()));
            } else if (dealsFoundCount == shoppingNeeds.size()) {
                notes.add(String.format("✓ Found prices for all %d items (no promotional deals available)", dealsFoundCount));
            } else if (dealsFoundCount > 0) {
                notes.add(String.format("ℹ️ Found prices for %d out of %d items", dealsFoundCount, shoppingNeeds.size()));
            }
            
            // Only mention missing deals if there are a few, not if it's many (too noisy)
            // Suppress default-price informational notes to keep the summary concise.
        }
        
        // Store optimization insights
        if (costByStore.size() > 1) {
            // Find the store with most items
            String bestStore = itemsByStore.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
            
            if (bestStore != null && itemsByStore.get(bestStore) > shoppingNeeds.size() / 2) {
                int itemsAtBestStore = itemsByStore.get(bestStore);
                double costAtBestStore = costByStore.getOrDefault(bestStore, 0.0);
                double otherStoresCost = costByStore.entrySet().stream()
                    .filter(e -> !e.getKey().equals(bestStore))
                    .mapToDouble(Map.Entry::getValue)
                    .sum();
                
                if (otherStoresCost > 0 && costAtBestStore > 0) {
                    notes.add(String.format("📍 Shopping tip: %d of %d items are at %s (consider consolidating trips)", 
                        itemsAtBestStore, shoppingNeeds.size(), bestStore));
                }
            }
            
            // Show cost breakdown if multiple stores
            if (costByStore.size() <= 3) {
                StringBuilder storeBreakdown = new StringBuilder("🏪 Cost breakdown: ");
                List<Map.Entry<String, Double>> sortedStores = costByStore.entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .collect(java.util.stream.Collectors.toList());
                
                for (int i = 0; i < sortedStores.size(); i++) {
                    Map.Entry<String, Double> entry = sortedStores.get(i);
                    double percent = (entry.getValue() / totalCost) * 100;
                    storeBreakdown.append(String.format("%s $%.2f (%.0f%%)", 
                        entry.getKey(), entry.getValue(), percent));
                    if (i < sortedStores.size() - 1) {
                        storeBreakdown.append(", ");
                    }
                }
                notes.add(storeBreakdown.toString());
            }
        } else if (costByStore.size() == 1) {
            String singleStore = costByStore.keySet().iterator().next();
            notes.add(String.format("📍 All items available at %s - one-stop shopping!", singleStore));
        }
        
        // Always add cost insights if we have items
        if (shoppingNeeds.size() > 0 && totalCost > 0) {
            // Average price per item insight
            double avgPricePerItem = totalCost / shoppingNeeds.size();
            notes.add(String.format("📊 Average price per item: $%.2f", avgPricePerItem));
            
            // Total cost summary
            notes.add(String.format("💵 Total shopping cost: $%.2f for %d items", totalCost, shoppingNeeds.size()));
        }
        
        return new OptimizeResponse(
            shoppingList,
            usesPantry,
            costByStore,
            notes
        );
    }
    
    private String getUnitForProduct(String product) {
        // Simple unit mapping - in production, this could come from a product catalog
        if (product.toLowerCase().contains("chicken") || product.toLowerCase().contains("beef") || 
            product.toLowerCase().contains("salmon") || product.toLowerCase().contains("bacon")) {
            return "lb";
        }
        if (product.toLowerCase().contains("egg")) {
            return "count";
        }
        if (product.toLowerCase().contains("milk") || product.toLowerCase().contains("broth")) {
            return "qt";
        }
        if (product.toLowerCase().contains("rice") || product.toLowerCase().contains("pasta") || 
            product.toLowerCase().contains("spaghetti") || product.toLowerCase().contains("penne")) {
            return "lb";
        }
        if (product.toLowerCase().contains("tortilla") || product.toLowerCase().contains("crouton")) {
            return "count";
        }
        // Bread is typically measured in slices, but we'll use "unit" for compatibility
        // with various pantry units (loaf, count, unit, etc.)
        if (product.toLowerCase().contains("bread")) {
            return "unit";
        }
        return "unit";
    }
    
    /**
     * Normalize ingredient names for better matching
     * Removes common prefixes/suffixes and standardizes
     */
    private String normalizeIngredientName(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("\\s+", " ")
                .replaceAll("^whole\\s+", "")
                .replaceAll("^fresh\\s+", "")
                .replaceAll("^canned\\s+", "")
                .replaceAll("^frozen\\s+", "")
                .replaceAll("\\s+-\\.*$", "") // Remove trailing dashes
                .trim();
    }
    
    /**
     * Find partial matches (e.g., "Milk" matches "Whole Milk", "Rice" matches "White Rice")
     */
    private PantryItemDto findPartialMatch(String ingredient, List<PantryItemDto> pantryItems) {
        String normalizedIngredient = normalizeIngredientName(ingredient);
        String ingredientLower = ingredient.toLowerCase();
        
        // Special handling for bread - extract base word
        boolean ingredientIsBread = ingredientLower.contains("bread");
        
        for (PantryItemDto pantryItem : pantryItems) {
            String pantryNameLower = pantryItem.name().toLowerCase();
            String pantryNormalized = normalizeIngredientName(pantryItem.name());
            boolean pantryIsBread = pantryNameLower.contains("bread");
            
            // Special case: if both are bread-related, match them
            if (ingredientIsBread && pantryIsBread) {
                return pantryItem;
            }
            
            // Check if ingredient is contained in pantry item name or vice versa
            if (pantryNameLower.contains(ingredientLower) || 
                ingredientLower.contains(pantryNameLower) ||
                pantryNormalized.equals(normalizedIngredient)) {
                return pantryItem;
            }
            
            // Special handling for single-word ingredients (like "flour")
            // Check if both are single words and match after normalization
            // BUT be more strict - require exact match or very close match
            String[] ingredientWords = normalizedIngredient.split("\\s+");
            String[] pantryWords = pantryNormalized.split("\\s+");
            if (ingredientWords.length == 1 && pantryWords.length >= 1) {
                // If ingredient is single word, check if it matches the first word of pantry item
                // Be strict: require exact match or the pantry word starts with ingredient word
                if (ingredientWords[0].equals(pantryWords[0]) || 
                    (pantryWords[0].startsWith(ingredientWords[0]) && ingredientWords[0].length() >= 4)) {
                    // Only match if ingredient word is at least 4 chars to avoid false matches
                    return pantryItem;
                }
            }
            if (pantryWords.length == 1 && ingredientWords.length >= 1) {
                // If pantry item is single word, check if it matches the first word of ingredient
                // Be strict: require exact match or the ingredient word starts with pantry word
                if (pantryWords[0].equals(ingredientWords[0]) || 
                    (ingredientWords[0].startsWith(pantryWords[0]) && pantryWords[0].length() >= 4)) {
                    // Only match if pantry word is at least 4 chars to avoid false matches
                    return pantryItem;
                }
            }
            
            // Check for common variations
            if (matchesVariation(ingredientLower, pantryNameLower)) {
                return pantryItem;
            }
        }
        
        return null;
    }
    
    /**
     * Check if two ingredient names are variations of each other
     */
    private boolean matchesVariation(String name1, String name2) {
        // Extract base names (remove common prefixes/suffixes)
        String base1 = extractBaseName(name1);
        String base2 = extractBaseName(name2);
        
        // If base names match, they're variations
        if (base1.equals(base2)) {
            return true;
        }
        
        // Check if one contains the other
        if (name1.contains(base2) || name2.contains(base1)) {
            return true;
        }
        
        // Common variations mapping
        Map<String, List<String>> variations = Map.of(
            "milk", List.of("whole milk", "2% milk", "skim milk", "almond milk", "soy milk"),
            "rice", List.of("white rice", "brown rice", "jasmine rice", "basmati rice", "long grain rice"),
            "eggs", List.of("egg", "large eggs", "chicken eggs", "eggs"),
            "bread", List.of("white bread", "wheat bread", "whole wheat bread", "bread", "sourdough bread", "rye bread", "baguette", "dinner rolls", "loaf"),
            "chicken", List.of("chicken breast", "chicken thighs", "whole chicken", "chicken"),
            "beef", List.of("ground beef", "beef steak", "beef roast", "beef"),
            "soy sauce", List.of("soy sauce", "dark soy sauce", "light soy sauce"),
            "flour", List.of("flour", "all-purpose flour", "whole wheat flour", "white flour", "bread flour", "cake flour", "tempura flour", "all purpose flour")
        );
        
        // Check if either name is a variation of the other
        for (Map.Entry<String, List<String>> entry : variations.entrySet()) {
            String base = entry.getKey();
            if ((name1.contains(base) || base1.contains(base)) && 
                entry.getValue().stream().anyMatch(v -> name2.contains(v) || base2.contains(v))) {
                return true;
            }
            if ((name2.contains(base) || base2.contains(base)) && 
                entry.getValue().stream().anyMatch(v -> name1.contains(v) || base1.contains(v))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Extract base name from ingredient (removes quantities, sizes, etc.)
     */
    private String extractBaseName(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("\\d+\\s*(lb|kg|g|oz|ml|l|unit|count|pack)\\b", "") // Remove quantities
                .replaceAll("\\s+", " ")
                .replaceAll("^whole\\s+|^fresh\\s+|^canned\\s+|^frozen\\s+", "")
                .replaceAll("\\s+-\\s*.*$", "") // Remove everything after dash
                .trim();
    }
    
    /**
     * Check if a unit is count-like (unit, count, loaf, slice, piece, etc.)
     */
    private boolean isCountLikeUnit(String unit) {
        if (unit == null) return true; // null defaults to count-like
        String unitLower = unit.toLowerCase().trim();
        return unitLower.equals("unit") || unitLower.equals("units") ||
               unitLower.equals("count") || unitLower.equals("counts") ||
               unitLower.equals("loaf") || unitLower.equals("loaves") ||
               unitLower.equals("slice") || unitLower.equals("slices") ||
               unitLower.equals("piece") || unitLower.equals("pieces") ||
               unitLower.equals("item") || unitLower.equals("items") ||
               unitLower.equals("bun") || unitLower.equals("buns") ||
               unitLower.equals("roll") || unitLower.equals("rolls");
    }
    
    /**
     * Normalize store name for consistent display
     * Capitalizes first letter of each word
     */
    private String normalizeStoreName(String storeName) {
        if (storeName == null || storeName.isEmpty()) {
            return "Walmart"; // Default
        }
        String lower = storeName.toLowerCase().trim();
        // Capitalize first letter of each word
        String[] words = lower.split("\\s+");
        StringBuilder normalized = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (words[i].length() > 0) {
                normalized.append(Character.toUpperCase(words[i].charAt(0)));
                if (words[i].length() > 1) {
                    normalized.append(words[i].substring(1));
                }
            }
            if (i < words.length - 1) {
                normalized.append(" ");
            }
        }
        return normalized.toString();
    }
}

