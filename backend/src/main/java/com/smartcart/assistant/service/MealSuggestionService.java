package com.smartcart.assistant.service;

import com.smartcart.assistant.dto.MealSuggestion;
import com.smartcart.pantry.model.PantryItem;
import com.smartcart.pantry.repository.PantryRepository;
import com.smartcart.deals.model.Deal;
import com.smartcart.deals.repository.DealRepository;
import com.smartcart.optimize.service.MealCatalogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-powered meal suggestion service
 * Analyzes pantry inventory and local deals to suggest meals
 */
@Service
public class MealSuggestionService {
    
    private static final Logger logger = LoggerFactory.getLogger(MealSuggestionService.class);
    
    private final PantryRepository pantryRepository;
    private final DealRepository dealRepository;
    private final MealCatalogService mealCatalogService;
    
    public MealSuggestionService(
            PantryRepository pantryRepository,
            DealRepository dealRepository,
            MealCatalogService mealCatalogService) {
        this.pantryRepository = pantryRepository;
        this.dealRepository = dealRepository;
        this.mealCatalogService = mealCatalogService;
    }
    
    /**
     * Generate meal suggestions based on pantry and deals
     * Returns top 3 meal ideas with reasoning
     */
    public List<MealSuggestion> suggestMeals(String userId) {
        logger.info("Generating meal suggestions for user: {}", userId);
        
        // Get user's pantry
        List<PantryItem> pantryItems = pantryRepository.findByUserId(userId);
        // Use name instead of productId for matching (productId is UUID, name is the actual item name)
        Set<String> availableProducts = pantryItems.stream()
                .map(PantryItem::getName)
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        
        logger.info("User has {} pantry items: {}", availableProducts.size(), availableProducts);
        
        // Get today's deals
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        List<Deal> todayDeals = dealRepository.findByDate(today);
        Map<String, Deal> productDeals = todayDeals.stream()
                .collect(Collectors.toMap(Deal::getProductId, d -> d, (d1, d2) -> d1));
        
        // Get all meals (Map<mealId, Map<ingredient, quantity>>)
        Map<String, Map<String, Double>> allMeals = mealCatalogService.getAllMeals();
        
        // Score each meal based on pantry availability and deals
        List<MealSuggestion> allScoredMeals = allMeals.entrySet().stream()
                .map(entry -> {
                    String mealId = entry.getKey();
                    Map<String, Double> ingredients = entry.getValue();
                    String category = mealCatalogService.getMealCategory(mealId);
                    // Better description based on category
                    String description = getMealDescription(mealId, category);
                    return scoreMeal(mealId, mealId, description, ingredients, availableProducts, productDeals);
                })
                .sorted((a, b) -> Double.compare(b.score(), a.score()))
                .collect(Collectors.toList());
        
        // Group meals by score ranges to ensure variety
        // Take top 3, but add randomization to get different suggestions on each call
        List<MealSuggestion> suggestions = new ArrayList<>();
        
        if (allScoredMeals.isEmpty()) {
            logger.warn("No meals available for suggestions");
            return suggestions;
        }
        
        // Get top scoring meals (score >= 20% of max score) for maximum variety
        double maxScore = allScoredMeals.get(0).score();
        double threshold = Math.max(0, maxScore * 0.2); // At least 20% of top score for more options
        
        List<MealSuggestion> qualifiedMeals = allScoredMeals.stream()
                .filter(meal -> meal.score() >= threshold)
                .collect(Collectors.toList());
        
        logger.info("Found {} qualified meals (threshold: {})", qualifiedMeals.size(), threshold);
        
        // Use nanoTime for better randomization (more granular than currentTimeMillis)
        long seed = System.nanoTime();
        Random random = new Random(seed);
        
        // If we have enough meals, use more aggressive randomization
        if (qualifiedMeals.size() > 3) {
            // Shuffle all qualified meals
            Collections.shuffle(qualifiedMeals, random);
            
            // Instead of just taking first 3, randomly select 3 from different parts of the list
            // This ensures we get different combinations each time
            List<MealSuggestion> selected = new ArrayList<>();
            
            // Divide into segments and pick one from each segment
            int segmentSize = Math.max(1, qualifiedMeals.size() / 3);
            for (int i = 0; i < 3 && selected.size() < 3; i++) {
                int startIdx = i * segmentSize;
                int endIdx = Math.min(startIdx + segmentSize, qualifiedMeals.size());
                if (startIdx < qualifiedMeals.size()) {
                    int randomIdx = startIdx + random.nextInt(Math.max(1, endIdx - startIdx));
                    MealSuggestion meal = qualifiedMeals.get(randomIdx);
                    if (!selected.contains(meal)) {
                        selected.add(meal);
                    }
                }
            }
            
            // If we don't have 3 yet, fill from remaining
            if (selected.size() < 3) {
                for (MealSuggestion meal : qualifiedMeals) {
                    if (!selected.contains(meal) && selected.size() < 3) {
                        selected.add(meal);
                    }
                }
            }
            
            suggestions = selected;
        } else {
            // Not enough meals, just shuffle what we have
            Collections.shuffle(qualifiedMeals, random);
            suggestions = qualifiedMeals.stream().limit(3).collect(Collectors.toList());
        }
        
        // Final shuffle of the selected 3 for extra randomness
        Collections.shuffle(suggestions, new Random(System.nanoTime() + 1000));
        
        logger.info("Generated {} meal suggestions: {}", suggestions.size(), 
                suggestions.stream().map(m -> m.name()).collect(Collectors.joining(", ")));
        return suggestions;
    }
    
    private MealSuggestion scoreMeal(
            String mealId,
            String mealName,
            String description,
            Map<String, Double> ingredients,
            Set<String> availableProducts,
            Map<String, Deal> productDeals) {
        
        double score = 0.0;
        List<String> reasons = new ArrayList<>();
        int pantryMatchCount = 0;
        int dealMatchCount = 0;
        int missingCount = 0;
        List<String> missingItems = new ArrayList<>();
        
        // Check ingredient availability
        for (Map.Entry<String, Double> ingredient : ingredients.entrySet()) {
            String ingredientName = ingredient.getKey();
            String normalizedIngredient = normalizeProductName(ingredientName);
            
            // Try to match against pantry products (names are already lowercase)
            boolean matched = false;
            for (String pantryItemName : availableProducts) {
                String normalizedPantryName = normalizeProductName(pantryItemName);
                // Check if ingredient matches pantry item (bidirectional matching)
                if (normalizedPantryName.contains(normalizedIngredient) || 
                    normalizedIngredient.contains(normalizedPantryName) ||
                    normalizedPantryName.equals(normalizedIngredient)) {
                    pantryMatchCount++;
                    score += 20; // High score for pantry items
                    reasons.add(String.format("✓ Have %s in pantry", ingredientName));
                    matched = true;
                    break;
                }
            }
            
            // Try to match against deals
            if (!matched) {
                for (Map.Entry<String, Deal> dealEntry : productDeals.entrySet()) {
                    String dealProductId = dealEntry.getKey();
                    if (normalizeProductName(dealProductId).contains(normalizedIngredient) ||
                        normalizedIngredient.contains(normalizeProductName(dealProductId))) {
                        dealMatchCount++;
                        Deal deal = dealEntry.getValue();
                        double discount = ((deal.getUnitPrice() - deal.getPromoPrice()) / deal.getUnitPrice()) * 100;
                        score += 15 + Math.min(discount, 10); // Bonus for deals
                        reasons.add(String.format("💰 %s on sale (%d%% off)", 
                                ingredientName, (int)discount));
                        matched = true;
                        break;
                    }
                }
            }
            
            if (!matched) {
                missingCount++;
                missingItems.add(ingredientName);
            }
        }
        
        // Penalize meals with many missing ingredients
        score -= missingCount * 5;
        
        // Bonus for meals with many pantry items
        if (pantryMatchCount > 2) {
            score += 10;
            reasons.add("📦 Great use of pantry items!");
        }
        
        // Bonus for meals with deals
        if (dealMatchCount > 0) {
            score += 5;
            reasons.add(String.format("🎯 %d ingredient(s) on sale", dealMatchCount));
        }
        
        String suggestionReason = String.join(" • ", reasons);
        if (missingCount > 0) {
            suggestionReason += String.format(" • Need to buy: %s", 
                    String.join(", ", missingItems.subList(0, Math.min(3, missingItems.size()))));
        }
        
        return new MealSuggestion(
                mealId,
                mealName,
                description,
                score,
                suggestionReason,
                pantryMatchCount,
                dealMatchCount,
                missingCount
        );
    }
    
    private String getMealDescription(String mealId, String category) {
        // Provide more descriptive text based on category
        switch (category.toLowerCase()) {
            case "american":
                return String.format("A classic American %s - perfect for a hearty meal", mealId.toLowerCase());
            case "italian":
                return String.format("An authentic Italian %s - rich flavors and comforting", mealId.toLowerCase());
            case "asian":
                return String.format("A flavorful Asian %s - bold spices and fresh ingredients", mealId.toLowerCase());
            case "mexican":
                return String.format("A vibrant Mexican %s - zesty and satisfying", mealId.toLowerCase());
            case "seafood":
                return String.format("Fresh seafood %s - light and nutritious", mealId.toLowerCase());
            case "breakfast":
                return String.format("A delicious breakfast %s - start your day right", mealId.toLowerCase());
            default:
                return String.format("A delicious %s dish", category.toLowerCase());
        }
    }
    
    private String normalizeProductName(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}

