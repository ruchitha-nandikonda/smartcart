package com.smartcart.pantry.dto;

import java.util.List;

public record PantryItemDto(
    String productId,
    String name,
    double quantity,
    String unit,
    String lastUpdated,
    String estExpiry,
    String source,
    String packSize,
    List<String> categories
) {}
