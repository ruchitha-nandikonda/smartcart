package com.smartcart.optimize.dto;

import java.util.List;

public record MealDto(
    String id,
    String name,
    String category,
    List<String> tags
) {}

