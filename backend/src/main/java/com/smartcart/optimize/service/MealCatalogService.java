package com.smartcart.optimize.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Curated meal catalog with most US-known dishes
 * Includes meals with custom-provided images
 * Focus: More American meals, fewer other cuisines
 */
@Service
public class MealCatalogService {
    
    private static final Map<String, Map<String, Double>> MEAL_CATALOG = new HashMap<>();
    private static final Map<String, String> MEAL_CATEGORIES = new HashMap<>();
    
    static {
        // Italian Cuisine (2 meals) - only custom image meals
        addMeal("Italian", "Lasagna", Map.of("Lasagna Noodles", 0.5, "Ground Beef", 1.0, "Ricotta", 0.5, "Mozzarella", 0.5, "Tomato Sauce", 1.0, "Onions", 0.5));
        addMeal("Italian", "Pepperoni Pizza", Map.of("Pizza Dough", 1.0, "Mozzarella", 0.5, "Pepperoni", 0.25, "Tomato Sauce", 0.5));
        
        // Asian Cuisine (8 meals) - only custom image meals and most famous
        addMeal("Asian", "Pad Thai", Map.of("Rice Noodles", 0.5, "Shrimp", 0.5, "Eggs", 2.0, "Bean Sprouts", 0.5, "Peanuts", 0.1, "Lime", 1.0));
        addMeal("Asian", "Orange Chicken", Map.of("Chicken Breast", 1.0, "Orange Juice", 0.25, "Soy Sauce", 0.05, "Rice", 1.0, "Cornstarch", 0.05));
        addMeal("Asian", "General Tso's", Map.of("Chicken Breast", 1.0, "Soy Sauce", 0.05, "Ginger", 0.02, "Garlic", 0.02, "Rice", 1.0, "Cornstarch", 0.05));
        addMeal("Asian", "Chicken Curry", Map.of("Chicken Breast", 1.0, "Curry Powder", 0.02, "Coconut Milk", 0.5, "Onions", 0.5, "Potatoes", 1.0, "Rice", 1.0));
        addMeal("Asian", "Ramen", Map.of("Ramen Noodles", 0.5, "Eggs", 2.0, "Pork", 0.5, "Green Onions", 0.25, "Soy Sauce", 0.05));
        addMeal("Asian", "Chicken Lo Mein", Map.of("Chicken Breast", 0.75, "Egg Noodles", 0.5, "Bell Peppers", 1.0, "Carrots", 0.5, "Soy Sauce", 0.05));
        addMeal("Asian", "Shrimp Fried Rice", Map.of("Shrimp", 0.5, "Rice", 2.0, "Eggs", 2.0, "Soy Sauce", 0.05, "Peas", 0.5, "Carrots", 0.5));
        addMeal("Asian", "Mongolian Beef", Map.of("Beef Steak", 1.0, "Soy Sauce", 0.05, "Brown Sugar", 0.05, "Garlic", 0.02, "Rice", 1.0));
        
        // Mexican Cuisine (3 meals) - only custom image meals
        addMeal("Mexican", "Chicken Tacos", Map.of("Chicken Breast", 1.0, "Tortillas", 8.0, "Tomatoes", 2.0, "Lettuce", 0.5, "Cheese", 0.25, "Onions", 0.5, "Salsa", 0.25));
        addMeal("Mexican", "Fish Tacos", Map.of("White Fish", 1.0, "Tortillas", 8.0, "Cabbage", 0.5, "Lime", 2.0, "Sour Cream", 0.25, "Salsa", 0.25));
        addMeal("Mexican", "Chicken Fajitas", Map.of("Chicken Breast", 1.0, "Bell Peppers", 2.0, "Onions", 1.0, "Tortillas", 6.0, "Sour Cream", 0.25));
        
        // American Cuisine (32 meals) - includes custom image meals + many more famous American dishes
        addMeal("American", "Hamburgers", Map.of("Ground Beef", 1.0, "Hamburger Buns", 4.0, "Lettuce", 0.5, "Tomatoes", 2.0, "Onions", 0.5, "Pickles", 0.25, "Cheese", 0.25));
        addMeal("American", "Buffalo Wings", Map.of("Chicken Wings", 2.0, "Hot Sauce", 0.25, "Butter", 0.25, "Celery", 1.0, "Blue Cheese", 0.25));
        addMeal("American", "Mac and Cheese", Map.of("Macaroni", 0.5, "Cheddar Cheese", 0.5, "Milk", 0.5, "Butter", 0.25, "Flour", 0.1));
        addMeal("American", "BBQ Chicken", Map.of("Chicken", 1.5, "BBQ Sauce", 0.5, "Corn", 2.0, "Potatoes", 2.0));
        addMeal("American", "Fried Chicken", Map.of("Chicken", 1.5, "Flour", 0.5, "Eggs", 2.0, "Bread Crumbs", 0.5, "Potatoes", 2.0));
        addMeal("American", "Beef Stew", Map.of("Beef Steak", 1.0, "Potatoes", 2.0, "Carrots", 1.0, "Onions", 0.5, "Beef Broth", 1.0));
        addMeal("American", "Hot Dogs", Map.of("Hot Dogs", 4.0, "Hot Dog Buns", 4.0, "Ketchup", 0.25, "Mustard", 0.25, "Onions", 0.5));
        addMeal("American", "Pulled Pork", Map.of("Pork Shoulder", 1.5, "BBQ Sauce", 0.5, "Hamburger Buns", 4.0, "Coleslaw", 0.5));
        addMeal("American", "Meatloaf", Map.of("Ground Beef", 1.5, "Bread Crumbs", 0.25, "Eggs", 1.0, "Onions", 0.5, "Ketchup", 0.25, "Potatoes", 2.0));
        addMeal("American", "Chili", Map.of("Ground Beef", 1.0, "Kidney Beans", 1.0, "Tomatoes", 2.0, "Onions", 0.5, "Chili Powder", 0.02));
        addMeal("American", "Grilled Cheese", Map.of("Bread", 4.0, "Cheddar Cheese", 0.5, "Butter", 0.25));
        addMeal("American", "Chicken Noodle Soup", Map.of("Chicken", 0.5, "Egg Noodles", 0.5, "Carrots", 1.0, "Celery", 1.0, "Chicken Broth", 1.0, "Onions", 0.5));
        addMeal("American", "French Onion Soup", Map.of("Onions", 3.0, "Beef Broth", 1.0, "Butter", 0.25, "Bread", 2.0, "Swiss Cheese", 0.5));
        addMeal("American", "Tomato Soup", Map.of("Tomatoes", 4.0, "Onions", 0.5, "Garlic", 0.02, "Heavy Cream", 0.25, "Basil", 0.05));
        addMeal("American", "BLT", Map.of("Bacon", 0.5, "Bread", 4.0, "Lettuce", 0.5, "Tomatoes", 2.0, "Mayonnaise", 0.25));
        addMeal("American", "Reuben Sandwich", Map.of("Rye Bread", 4.0, "Corned Beef", 1.0, "Swiss Cheese", 0.5, "Sauerkraut", 0.5, "Thousand Island", 0.25));
        addMeal("American", "Philly Cheese Steak", Map.of("Ribeye Steak", 1.0, "Hoagie Rolls", 2.0, "Provolone", 0.5, "Onions", 0.5, "Bell Peppers", 0.5));
        // 17 new famous American meals
        addMeal("American", "Apple Pie", Map.of("Apples", 6.0, "Flour", 0.5, "Butter", 0.25, "Sugar", 0.25, "Cinnamon", 0.02));
        addMeal("American", "BBQ Ribs", Map.of("Pork Ribs", 2.0, "BBQ Sauce", 0.5, "Brown Sugar", 0.1, "Corn", 2.0));
        addMeal("American", "Clam Chowder", Map.of("Clams", 1.0, "Potatoes", 2.0, "Bacon", 0.25, "Onions", 0.5, "Heavy Cream", 0.5));
        addMeal("American", "Cornbread", Map.of("Cornmeal", 0.5, "Flour", 0.25, "Eggs", 2.0, "Milk", 0.5, "Butter", 0.25));
        addMeal("American", "Deep-Dish Pizza", Map.of("Pizza Dough", 1.5, "Mozzarella", 1.0, "Sausage", 0.5, "Tomato Sauce", 1.0, "Parmesan", 0.25));
        addMeal("American", "Jambalaya", Map.of("Rice", 2.0, "Chicken", 1.0, "Sausage", 0.5, "Shrimp", 0.5, "Bell Peppers", 1.0, "Onions", 0.5));
        addMeal("American", "Pot Roast", Map.of("Beef Roast", 2.0, "Potatoes", 2.0, "Carrots", 1.0, "Onions", 1.0, "Beef Broth", 1.0));
        addMeal("American", "Shepherd's Pie", Map.of("Ground Beef", 1.0, "Potatoes", 2.0, "Carrots", 1.0, "Peas", 0.5, "Onions", 0.5, "Beef Broth", 0.5));
        addMeal("American", "Corn Dogs", Map.of("Hot Dogs", 4.0, "Cornmeal", 0.5, "Flour", 0.25, "Eggs", 1.0, "Milk", 0.25));
        addMeal("American", "Biscuits and Gravy", Map.of("Biscuits", 4.0, "Sausage", 0.5, "Flour", 0.1, "Milk", 0.5, "Black Pepper", 0.01));
        addMeal("American", "Chicken Pot Pie", Map.of("Chicken", 1.0, "Pie Crust", 1.0, "Carrots", 1.0, "Peas", 0.5, "Potatoes", 1.0, "Onions", 0.5));
        addMeal("American", "Tuna Casserole", Map.of("Tuna", 1.0, "Pasta", 0.5, "Mushrooms", 0.5, "Peas", 0.5, "Cream of Mushroom Soup", 1.0, "Bread Crumbs", 0.25));
        addMeal("American", "Caesar Salad", Map.of("Romaine Lettuce", 1.0, "Caesar Dressing", 0.25, "Parmesan", 0.25, "Croutons", 0.25, "Chicken", 1.0));
        addMeal("American", "Cobb Salad", Map.of("Lettuce", 1.0, "Bacon", 0.5, "Eggs", 3.0, "Chicken", 1.0, "Avocado", 1.0, "Blue Cheese", 0.25, "Tomatoes", 2.0));
        addMeal("American", "Lobster Roll", Map.of("Lobster", 1.0, "Hot Dog Buns", 2.0, "Mayonnaise", 0.25, "Celery", 0.5, "Lemon", 0.5));
        addMeal("American", "Fish and Chips", Map.of("White Fish", 1.5, "Potatoes", 2.0, "Flour", 0.5, "Beer", 0.25, "Tartar Sauce", 0.25));
        addMeal("American", "Corn on the Cob", Map.of("Corn", 4.0, "Butter", 0.25, "Salt", 0.01));
        addMeal("American", "Gumbo", Map.of("Rice", 2.0, "Chicken", 1.0, "Sausage", 0.5, "Shrimp", 0.5, "Okra", 1.0, "Bell Peppers", 1.0, "Onions", 0.5));
        addMeal("American", "Tater Tots", Map.of("Potatoes", 2.0, "Flour", 0.1, "Eggs", 1.0, "Oil", 0.1));
        
        // Seafood (2 meals) - custom image meals
        addMeal("Seafood", "Grilled Salmon", Map.of("Salmon", 1.0, "Lemon", 1.0, "Asparagus", 0.5, "Olive Oil", 0.05, "Salt", 0.01, "Black Pepper", 0.01));
        addMeal("Seafood", "Shrimp Scampi", Map.of("Shrimp", 1.0, "Garlic", 0.02, "Butter", 0.25, "Lemon", 1.0, "White Wine", 0.25, "Pasta", 0.5));
        
        // Breakfast (3 meals) - includes custom image meals
        addMeal("Breakfast", "Pancakes", Map.of("Flour", 0.5, "Eggs", 2.0, "Butter", 0.25, "Maple Syrup", 0.25));
        addMeal("Breakfast", "French Toast", Map.of("Bread", 0.5, "Eggs", 3.0, "Milk", 0.25, "Butter", 0.25, "Maple Syrup", 0.25));
        addMeal("Breakfast", "Waffles", Map.of("Flour", 0.5, "Eggs", 2.0, "Milk", 0.5, "Butter", 0.25, "Maple Syrup", 0.25));
    }
    
    private static void addMeal(String category, String name, Map<String, Double> ingredients) {
        MEAL_CATALOG.put(name, ingredients);
        MEAL_CATEGORIES.put(name, category);
    }
    
    public Map<String, Map<String, Double>> getAllMeals() {
        return new HashMap<>(MEAL_CATALOG);
    }
    
    public List<String> getAllMealIds() {
        return new ArrayList<>(MEAL_CATALOG.keySet());
    }
    
    public Map<String, Double> getMealIngredients(String mealId) {
        return MEAL_CATALOG.getOrDefault(mealId, Collections.emptyMap());
    }
    
    public boolean mealExists(String mealId) {
        return MEAL_CATALOG.containsKey(mealId);
    }
    
    public String getMealCategory(String mealId) {
        return MEAL_CATEGORIES.getOrDefault(mealId, "Uncategorized");
    }
    
    public List<String> getAllCategories() {
        // Get all unique categories and filter out "Comfort Food" if it exists
        Set<String> categories = new HashSet<>(MEAL_CATEGORIES.values());
        categories.remove("Comfort Food"); // Explicitly remove Comfort Food category
        // Sort for consistent ordering
        List<String> sortedCategories = new ArrayList<>(categories);
        Collections.sort(sortedCategories);
        return sortedCategories;
    }
    
    public List<String> getMealsByCategory(String category) {
        // Return empty list if requesting Comfort Food category
        if ("Comfort Food".equalsIgnoreCase(category)) {
            return Collections.emptyList();
        }
        
        List<String> meals = new ArrayList<>();
        for (Map.Entry<String, String> entry : MEAL_CATEGORIES.entrySet()) {
            if (entry.getValue().equals(category)) {
                meals.add(entry.getKey());
            }
        }
        return meals;
    }
}
