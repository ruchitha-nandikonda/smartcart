package com.smartcart.optimize;

import com.smartcart.optimize.dto.*;
import com.smartcart.optimize.service.OptimizerService;
import com.smartcart.optimize.service.MealCatalogService;
import com.smartcart.shoppinglist.service.ShoppingListService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/optimize")
public class OptimizeController {
    
    private final OptimizerService optimizerService;
    private final MealCatalogService mealCatalogService;
    private final ShoppingListService shoppingListService;
    
    public OptimizeController(OptimizerService optimizerService, MealCatalogService mealCatalogService,
                             ShoppingListService shoppingListService) {
        this.optimizerService = optimizerService;
        this.mealCatalogService = mealCatalogService;
        this.shoppingListService = shoppingListService;
    }
    
    @GetMapping("/meals")
    public ResponseEntity<List<String>> getAllMeals(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestParam(value = "category", required = false) String category) {
        // This endpoint doesn't require userId, but we accept it if present
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(mealCatalogService.getMealsByCategory(category));
        }
        return ResponseEntity.ok(mealCatalogService.getAllMealIds());
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(mealCatalogService.getAllCategories());
    }
    
    @PostMapping
    public ResponseEntity<OptimizeResponse> optimize(
            @RequestAttribute("userId") String userId,
            @Valid @RequestBody OptimizeRequest request) {
        OptimizeResponse response = optimizerService.optimize(userId, request);
        
        // Save shopping list to history
        List<String> meals = request.mealServings().keySet().stream().toList();
        int totalServings = request.mealServings().values().stream().mapToInt(Integer::intValue).sum();
        shoppingListService.saveShoppingList(userId, response, meals, totalServings);
        
        return ResponseEntity.ok(response);
    }
}

