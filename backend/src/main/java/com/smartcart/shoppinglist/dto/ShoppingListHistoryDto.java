package com.smartcart.shoppinglist.dto;

import com.smartcart.shoppinglist.model.ShoppingListHistory;

import java.util.List;
import java.util.Map;

public record ShoppingListHistoryDto(
    String listId,
    Long createdAt,
    List<ShoppingListItemDto> items,
    Map<String, Double> costByStore,
    Double totalCost,
    List<String> meals,
    Integer totalServings,
    List<String> usesPantry
) {
    public static ShoppingListHistoryDto fromHistory(ShoppingListHistory history) {
        List<ShoppingListItemDto> items = history.getItems() != null ?
            history.getItems().stream()
                .map(item -> new ShoppingListItemDto(
                    item.getProductId(),
                    item.getQty(),
                    item.getUnit(),
                    item.getStoreId(),
                    item.getPrice()
                ))
                .toList() : List.of();
        
        return new ShoppingListHistoryDto(
            history.getListId(),
            history.getCreatedAt(),
            items,
            history.getCostByStore(),
            history.getTotalCost(),
            history.getMeals(),
            history.getTotalServings(),
            history.getUsesPantry()
        );
    }
    
    public record ShoppingListItemDto(
        String productId,
        Double qty,
        String unit,
        String storeId,
        Double price
    ) {}
}

