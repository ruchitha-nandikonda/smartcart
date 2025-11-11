package com.smartcart.favorites.dto;

import com.smartcart.favorites.model.MealFavorite;

import java.util.Map;

public record MealFavoriteDto(
    String favoriteId,
    String name,
    Map<String, Integer> mealServings,
    Long createdAt,
    Long lastUsed
) {
    public static MealFavoriteDto fromFavorite(MealFavorite favorite) {
        return new MealFavoriteDto(
            favorite.getFavoriteId(),
            favorite.getName(),
            favorite.getMealServings(),
            favorite.getCreatedAt(),
            favorite.getLastUsed()
        );
    }
}

