package com.smartcart.pantry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import java.util.List;

public record CreatePantryItemRequest(
    @NotBlank String name,
    @Min(0) double quantity,
    String unit,
    String estExpiry,
    String packSize,
    List<String> categories
) {}
