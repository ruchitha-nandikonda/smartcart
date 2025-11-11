package com.smartcart.optimize.dto;

public record ShoppingItem(
    String productId,
    double qty,
    String unit,
    String storeId,
    double price,
    Double originalPrice, // Original price before deal (null if no deal)
    Double savings, // Amount saved (null if no deal)
    Boolean hasDeal // Whether this item has a deal
) {
    public ShoppingItem(String productId, double qty, String unit, String storeId, double price) {
        this(productId, qty, unit, storeId, price, null, null, false);
    }
}

