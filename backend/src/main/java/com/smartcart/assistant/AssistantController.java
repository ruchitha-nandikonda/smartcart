package com.smartcart.assistant;

import com.smartcart.assistant.dto.MealSuggestion;
import com.smartcart.assistant.service.MealSuggestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI Assistant controller for meal suggestions
 */
@RestController
@RequestMapping("/api/assistant")
public class AssistantController {
    
    private final MealSuggestionService mealSuggestionService;
    
    public AssistantController(MealSuggestionService mealSuggestionService) {
        this.mealSuggestionService = mealSuggestionService;
    }
    
    /**
     * Get meal suggestions based on pantry and deals
     * GET /api/assistant/suggest-meals
     */
    @GetMapping("/suggest-meals")
    public ResponseEntity<List<MealSuggestion>> suggestMeals(
            @RequestAttribute("userId") String userId) {
        
        List<MealSuggestion> suggestions = mealSuggestionService.suggestMeals(userId);
        return ResponseEntity.ok(suggestions);
    }
}









