package com.smartcart.assistant.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Meal suggestion with score and reasoning
 */
public record MealSuggestion(
    @JsonProperty("mealId") String mealId,
    @JsonProperty("name") String name,
    @JsonProperty("description") String description,
    @JsonProperty("score") double score,
    @JsonProperty("reason") String reason,
    @JsonProperty("pantryMatchCount") int pantryMatchCount,
    @JsonProperty("dealMatchCount") int dealMatchCount,
    @JsonProperty("missingCount") int missingCount
) {
}









