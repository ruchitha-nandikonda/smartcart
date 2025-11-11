package com.smartcart.optimize.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

public record OptimizeRequest(
    @NotEmpty Map<String, Integer> mealServings // mealId -> number of servings
) {}
