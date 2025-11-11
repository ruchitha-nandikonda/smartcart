package com.smartcart.optimize.dto;

import java.util.List;
import java.util.Map;

public record OptimizeResponse(
    List<ShoppingItem> list,
    List<String> usesPantry,
    Map<String, Double> costByStore,
    List<String> notes
) {}

