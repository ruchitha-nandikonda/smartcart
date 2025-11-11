package com.smartcart.receipts.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import com.smartcart.receipts.service.StringSimilarity;
import com.smartcart.receipts.service.ProductMatchResult;

/**
 * Maps receipt line items to canonical products
 * In production, this would use a more sophisticated ML-based matcher
 * For MVP, we use simple keyword matching and normalization
 */
@Service
public class ReceiptMapperService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReceiptMapperService.class);
    
    // Simple product catalog - in production, this would come from a database
    private static final Map<String, String> PRODUCT_MAP = new HashMap<>();
    
    static {
        // Expanded product catalog - 200+ common grocery items with variations
        // Dairy Products
        addProductVariations("milk", "milk", "whole milk", "2% milk", "1% milk", "skim milk", "fat-free milk", 
            "lactose-free milk", "almond milk", "soy milk", "oat milk", "coconut milk", "buttermilk", "heavy cream");
        addProductVariations("cheese", "cheese", "cheddar", "mozzarella", "swiss", "provolone", "american cheese",
            "colby jack", "monterey jack", "pepper jack", "gouda", "havarti", "muenster", "fontina", "gruyere",
            "brie", "feta", "goat cheese", "cream cheese", "ricotta", "cottage cheese", "parmesan", "romano");
        addProductVariations("yogurt", "yogurt", "greek yogurt", "plain yogurt", "vanilla yogurt", "strawberry yogurt",
            "blueberry yogurt", "peach yogurt", "sour cream", "kefir", "skyr");
        addProductVariations("eggs", "eggs", "large eggs", "extra large eggs", "jumbo eggs", "brown eggs", 
            "white eggs", "free range eggs", "organic eggs", "cage free eggs", "egg whites", "liquid egg whites");
        addProductVariations("butter", "butter", "salted butter", "unsalted butter", "margarine", "ghee", "vegan butter");
        addProductVariations("ice cream", "ice cream", "vanilla ice cream", "chocolate ice cream", "strawberry ice cream",
            "frozen yogurt", "gelato", "sorbet", "sherbet");
        
        // Meat & Poultry
        addProductVariations("chicken", "chicken", "chicken breast", "chicken thighs", "chicken wings", "chicken drumsticks",
            "whole chicken", "chicken tenders", "ground chicken", "chicken sausage");
        addProductVariations("beef", "beef", "ground beef", "beef steak", "beef roast", "beef ribs", "beef brisket",
            "beef chuck", "beef sirloin", "beef tenderloin", "beef stew meat", "beef jerky");
        addProductVariations("pork", "pork", "pork chops", "pork tenderloin", "pork roast", "pork ribs", "ground pork",
            "pork sausage", "bacon", "ham", "pork shoulder", "pork belly");
        addProductVariations("turkey", "turkey", "turkey breast", "ground turkey", "turkey sausage", "turkey bacon");
        addProductVariations("lamb", "lamb", "lamb chops", "ground lamb", "lamb leg", "lamb shoulder");
        
        // Seafood
        addProductVariations("salmon", "salmon", "atlantic salmon", "pacific salmon", "salmon fillet", "smoked salmon");
        addProductVariations("tuna", "tuna", "tuna steak", "canned tuna", "tuna salad");
        addProductVariations("shrimp", "shrimp", "jumbo shrimp", "large shrimp", "medium shrimp", "frozen shrimp");
        addProductVariations("fish", "fish", "white fish", "cod", "tilapia", "halibut", "mahi mahi", "snapper", "trout");
        addProductVariations("crab", "crab", "crab meat", "crab legs", "imitation crab");
        addProductVariations("lobster", "lobster", "lobster tail", "lobster meat");
        addProductVariations("scallops", "scallops", "sea scallops", "bay scallops");
        addProductVariations("mussels", "mussels", "fresh mussels", "frozen mussels");
        addProductVariations("oysters", "oysters", "fresh oysters", "canned oysters");
        
        // Produce - Vegetables
        addProductVariations("tomatoes", "tomatoes", "tomato", "cherry tomatoes", "roma tomatoes", "beefsteak tomatoes",
            "grape tomatoes", "canned tomatoes", "tomato sauce", "tomato paste");
        addProductVariations("onions", "onions", "onion", "yellow onions", "red onions", "white onions", "sweet onions",
            "green onions", "scallions", "shallots");
        addProductVariations("potatoes", "potatoes", "potato", "russet potatoes", "red potatoes", "yukon gold potatoes",
            "sweet potatoes", "fingerling potatoes", "potato chips");
        addProductVariations("lettuce", "lettuce", "iceberg lettuce", "romaine lettuce", "butter lettuce", "arugula",
            "spinach", "kale", "spring mix", "mixed greens");
        addProductVariations("carrots", "carrots", "carrot", "baby carrots", "whole carrots");
        addProductVariations("broccoli", "broccoli", "broccoli florets", "broccoli crowns");
        addProductVariations("bell peppers", "bell peppers", "bell pepper", "red bell pepper", "green bell pepper",
            "yellow bell pepper", "orange bell pepper");
        addProductVariations("mushrooms", "mushrooms", "mushroom", "button mushrooms", "cremini mushrooms", "portobello",
            "shiitake mushrooms", "oyster mushrooms");
        addProductVariations("zucchini", "zucchini", "zucchini squash", "yellow squash", "summer squash");
        addProductVariations("cucumber", "cucumber", "cucumbers", "english cucumber", "persian cucumber");
        addProductVariations("celery", "celery", "celery stalks", "celery hearts");
        addProductVariations("corn", "corn", "corn on the cob", "frozen corn", "canned corn");
        addProductVariations("peas", "peas", "green peas", "snow peas", "sugar snap peas", "frozen peas", "canned peas");
        addProductVariations("green beans", "green beans", "green bean", "french green beans", "haricot verts",
            "frozen green beans", "canned green beans");
        addProductVariations("asparagus", "asparagus", "asparagus spears");
        addProductVariations("cauliflower", "cauliflower", "cauliflower florets", "cauliflower rice");
        addProductVariations("cabbage", "cabbage", "green cabbage", "red cabbage", "napa cabbage", "savoy cabbage");
        addProductVariations("brussels sprouts", "brussels sprouts", "brussel sprouts");
        addProductVariations("eggplant", "eggplant", "aubergine");
        addProductVariations("avocado", "avocado", "avocados", "hass avocado");
        
        // Produce - Fruits
        addProductVariations("apples", "apples", "apple", "red delicious", "gala", "granny smith", "fuji", "honeycrisp",
            "pink lady", "mcintosh");
        addProductVariations("bananas", "bananas", "banana");
        addProductVariations("oranges", "oranges", "orange", "navel oranges", "valencia oranges", "blood oranges",
            "mandarin oranges", "clementines", "tangerines");
        addProductVariations("strawberries", "strawberries", "strawberry");
        addProductVariations("blueberries", "blueberries", "blueberry");
        addProductVariations("grapes", "grapes", "grape", "red grapes", "green grapes", "black grapes", "cotton candy grapes");
        addProductVariations("berries", "berries", "raspberries", "blackberries", "cranberries", "mulberries");
        addProductVariations("peaches", "peaches", "peach", "nectarines");
        addProductVariations("cherries", "cherries", "cherry", "sweet cherries", "tart cherries");
        addProductVariations("pineapple", "pineapple", "pineapples", "fresh pineapple", "canned pineapple");
        addProductVariations("mango", "mango", "mangoes", "mangos");
        addProductVariations("watermelon", "watermelon", "watermelons");
        addProductVariations("lemons", "lemons", "lemon");
        addProductVariations("limes", "limes", "lime");
        
        // Grains & Pasta
        addProductVariations("rice", "rice", "white rice", "brown rice", "jasmine rice", "basmati rice", "arborio rice",
            "wild rice", "sushi rice", "instant rice");
        addProductVariations("pasta", "pasta", "spaghetti", "penne", "fettuccine", "linguine", "rigatoni", "fusilli",
            "macaroni", "lasagna noodles", "ravioli", "tortellini", "gnocchi");
        addProductVariations("bread", "bread", "white bread", "wheat bread", "whole wheat bread", "sourdough bread",
            "rye bread", "multigrain bread", "italian bread", "french bread", "baguette", "dinner rolls", "hamburger buns",
            "hot dog buns", "english muffins", "bagels", "pita bread", "naan", "tortillas");
        addProductVariations("flour", "flour", "all-purpose flour", "whole wheat flour", "bread flour", "cake flour",
            "pastry flour", "self-rising flour", "almond flour", "coconut flour", "tempura flour");
        addProductVariations("oats", "oats", "oatmeal", "rolled oats", "steel cut oats", "quick oats", "old fashioned oats");
        addProductVariations("quinoa", "quinoa", "white quinoa", "red quinoa", "black quinoa");
        addProductVariations("barley", "barley", "pearl barley");
        addProductVariations("couscous", "couscous", "israeli couscous");
        
        // Baking & Spices
        addProductVariations("sugar", "sugar", "white sugar", "brown sugar", "powdered sugar", "confectioners sugar",
            "granulated sugar", "cane sugar", "raw sugar", "turbinado sugar");
        addProductVariations("salt", "salt", "table salt", "kosher salt", "sea salt", "himalayan salt", "iodized salt");
        addProductVariations("pepper", "pepper", "black pepper", "white pepper", "red pepper flakes", "cayenne pepper",
            "bell pepper", "bell peppers");
        addProductVariations("garlic", "garlic", "garlic cloves", "minced garlic", "garlic powder", "garlic salt");
        addProductVariations("ginger", "ginger", "fresh ginger", "ginger root", "ground ginger", "ginger powder");
        addProductVariations("cinnamon", "cinnamon", "ground cinnamon", "cinnamon sticks");
        addProductVariations("vanilla", "vanilla", "vanilla extract", "vanilla bean", "vanilla paste");
        addProductVariations("baking powder", "baking powder", "double acting baking powder");
        addProductVariations("baking soda", "baking soda", "sodium bicarbonate");
        addProductVariations("yeast", "yeast", "active dry yeast", "instant yeast", "rapid rise yeast");
        addProductVariations("chocolate", "chocolate", "chocolate chips", "dark chocolate", "milk chocolate",
            "white chocolate", "semi-sweet chocolate", "bittersweet chocolate", "cocoa powder");
        addProductVariations("coconut", "coconut", "shredded coconut", "coconut flakes", "coconut milk", "coconut oil");
        
        // Oils & Condiments
        addProductVariations("cooking oil", "cooking oil", "oil", "vegetable oil", "canola oil", "olive oil",
            "extra virgin olive oil", "avocado oil", "coconut oil", "sesame oil", "peanut oil", "grapeseed oil");
        addProductVariations("vinegar", "vinegar", "white vinegar", "apple cider vinegar", "balsamic vinegar",
            "red wine vinegar", "white wine vinegar", "rice vinegar");
        addProductVariations("soy sauce", "soy sauce", "dark soy sauce", "light soy sauce", "low sodium soy sauce",
            "tamari", "teriyaki sauce");
        addProductVariations("ketchup", "ketchup", "tomato ketchup");
        addProductVariations("mustard", "mustard", "yellow mustard", "dijon mustard", "whole grain mustard",
            "honey mustard");
        addProductVariations("mayonnaise", "mayonnaise", "mayo", "light mayonnaise", "vegan mayonnaise");
        addProductVariations("hot sauce", "hot sauce", "sriracha", "tabasco", "franks redhot", "cholula");
        addProductVariations("bbq sauce", "bbq sauce", "barbecue sauce", "bbq");
        addProductVariations("ranch", "ranch", "ranch dressing", "ranch dip");
        addProductVariations("salad dressing", "salad dressing", "italian dressing", "caesar dressing", "vinaigrette",
            "thousand island", "blue cheese dressing");
        
        // Canned & Packaged Goods
        addProductVariations("beans", "beans", "black beans", "kidney beans", "pinto beans", "navy beans", "cannellini beans",
            "chickpeas", "garbanzo beans", "lentils", "black eyed peas");
        addProductVariations("soup", "soup", "chicken soup", "vegetable soup", "tomato soup", "cream of mushroom soup",
            "cream of chicken soup", "beef broth", "chicken broth", "vegetable broth");
        addProductVariations("crackers", "crackers", "saltine crackers", "ritz crackers", "goldfish crackers",
            "wheat crackers", "graham crackers");
        addProductVariations("chips", "chips", "potato chips", "tortilla chips", "corn chips", "veggie chips");
        addProductVariations("nuts", "nuts", "almonds", "walnuts", "pecans", "cashews", "peanuts", "pistachios",
            "hazelnuts", "macadamia nuts", "pine nuts");
        addProductVariations("peanut butter", "peanut butter", "creamy peanut butter", "chunky peanut butter",
            "natural peanut butter", "almond butter", "cashew butter");
        
        // Beverages
        addProductVariations("water", "water", "bottled water", "sparkling water", "mineral water");
        addProductVariations("juice", "juice", "orange juice", "apple juice", "cranberry juice", "grape juice",
            "pineapple juice", "tomato juice", "vegetable juice");
        addProductVariations("soda", "soda", "cola", "coca cola", "pepsi", "sprite", "7up", "ginger ale", "root beer");
        addProductVariations("coffee", "coffee", "ground coffee", "coffee beans", "instant coffee", "decaf coffee",
            "espresso", "coffee pods", "k-cups");
        addProductVariations("tea", "tea", "black tea", "green tea", "herbal tea", "chai tea", "iced tea");
        
        // Frozen Foods
        addProductVariations("frozen vegetables", "frozen vegetables", "frozen broccoli", "frozen peas", "frozen corn",
            "frozen mixed vegetables", "frozen spinach");
        addProductVariations("frozen fruit", "frozen fruit", "frozen strawberries", "frozen blueberries", "frozen mango");
        addProductVariations("frozen pizza", "frozen pizza", "frozen pepperoni pizza", "frozen cheese pizza");
        addProductVariations("ice cream", "ice cream", "frozen yogurt", "gelato");
        
        // Snacks
        addProductVariations("cookies", "cookies", "chocolate chip cookies", "oreos", "chips ahoy");
        addProductVariations("candy", "candy", "chocolate bars", "gummy bears", "m&ms", "skittles");
        addProductVariations("granola bars", "granola bars", "protein bars", "energy bars", "breakfast bars");
        
        // Other
        addProductVariations("honey", "honey", "raw honey", "clover honey");
        addProductVariations("maple syrup", "maple syrup", "pancake syrup", "breakfast syrup");
        addProductVariations("jam", "jam", "jelly", "preserves", "strawberry jam", "grape jelly");
        addProductVariations("pasta sauce", "pasta sauce", "marinara sauce", "tomato sauce", "alfredo sauce",
            "pesto sauce");
    }
    
    private static void addProductVariations(String canonicalId, String... variations) {
        for (String variation : variations) {
            PRODUCT_MAP.put(variation.toLowerCase(), canonicalId);
        }
    }
    
    /**
     * Maps a raw receipt description to a canonical product ID with confidence score
     * Returns null if confidence is too low (will require user confirmation)
     */
    public ProductMatchResult mapToProductWithConfidence(String rawDescription) {
        if (rawDescription == null || rawDescription.trim().isEmpty()) {
            return ProductMatchResult.noMatch();
        }
        
        // Strip store noise words
        String cleaned = stripStoreNoise(rawDescription);
        
        // Normalize: lowercase, remove punctuation, collapse whitespace
        String normalized = normalize(cleaned);
        
        // Detect and normalize size tokens
        normalized = normalizeSizeTokens(normalized);
        
        double bestScore = 0.0;
        String bestMatch = null;
        String bestMatchType = "none";
        
        // Try exact match first
        for (Map.Entry<String, String> entry : PRODUCT_MAP.entrySet()) {
            if (normalized.equals(entry.getKey())) {
                logger.debug("Exact match: '{}' -> '{}'", rawDescription, entry.getValue());
                return new ProductMatchResult(entry.getValue(), 1.0, "exact");
            }
        }
        
        // Try substring match (synonym matching)
        for (Map.Entry<String, String> entry : PRODUCT_MAP.entrySet()) {
            if (normalized.contains(entry.getKey()) || entry.getKey().contains(normalized)) {
                double score = 0.95; // High confidence for substring match
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = entry.getValue();
                    bestMatchType = "synonym";
                }
            }
        }
        
        // Try Jaro-Winkler similarity for fuzzy matching
        for (Map.Entry<String, String> entry : PRODUCT_MAP.entrySet()) {
            double similarity = StringSimilarity.jaroWinkler(normalized, entry.getKey());
            if (similarity > bestScore && similarity >= 0.70) { // Minimum threshold
                bestScore = similarity;
                bestMatch = entry.getValue();
                bestMatchType = "fuzzy";
            }
        }
        
        // Return match if confidence >= 0.86 threshold (per spec)
        if (bestMatch != null && bestScore >= 0.86) {
            logger.debug("Matched '{}' to '{}' with confidence {} ({})", 
                    rawDescription, bestMatch, bestScore, bestMatchType);
            return new ProductMatchResult(bestMatch, bestScore, bestMatchType);
        }
        
        logger.debug("No confident match found for '{}' (best score: {})", rawDescription, bestScore);
        return ProductMatchResult.noMatch();
    }
    
    /**
     * Maps a raw receipt description to a canonical product ID
     * Returns null if confidence is too low (will require user confirmation)
     */
    public String mapToProduct(String rawDescription) {
        ProductMatchResult result = mapToProductWithConfidence(rawDescription);
        return result.canonicalProductId();
    }
    
    private String normalize(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
    
    /**
     * Strip store noise words like "club price", "txn", "subtotal"
     */
    private String stripStoreNoise(String text) {
        String[] noiseWords = {
            "club price", "member price", "sale", "discount", "txn", "transaction",
            "subtotal", "tax", "total", "savings", "you saved", "rebate",
            "coupon", "special", "limited time", "buy", "get", "free",
            "store brand", "private label", "house brand"
        };
        
        String cleaned = text.toLowerCase();
        for (String noise : noiseWords) {
            cleaned = cleaned.replaceAll("\\b" + Pattern.quote(noise) + "\\b", "");
        }
        return cleaned.trim();
    }
    
    /**
     * Normalize size tokens: "16oz", "1 lb", "500g" -> standard format
     */
    private String normalizeSizeTokens(String text) {
        // This removes size info for matching purposes
        // Actual size extraction can be done separately if needed
        return text.replaceAll("\\d+\\s*(oz|ounce|ounces|lb|lbs|pound|pounds|kg|kilogram|g|gram|grams|ml|milliliter|milliliters|l|liter|liters)\\b", "")
                .replaceAll("\\d+-?pack", "")
                .replaceAll("\\d+\\s*count", "")
                .trim();
    }
}


