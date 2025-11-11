package com.smartcart.favorites.service;

import com.smartcart.favorites.dto.MealFavoriteDto;
import com.smartcart.favorites.model.MealFavorite;
import com.smartcart.favorites.repository.MealFavoriteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MealFavoriteService {
    
    private final MealFavoriteRepository repository;
    
    public MealFavoriteService(MealFavoriteRepository repository) {
        this.repository = repository;
    }
    
    public MealFavoriteDto create(String userId, String name, java.util.Map<String, Integer> mealServings) {
        MealFavorite favorite = new MealFavorite();
        favorite.setUserId(userId);
        favorite.setFavoriteId(UUID.randomUUID().toString());
        favorite.setName(name);
        favorite.setMealServings(mealServings);
        favorite.setCreatedAt(System.currentTimeMillis());
        favorite.setLastUsed(System.currentTimeMillis());
        
        repository.save(favorite);
        return MealFavoriteDto.fromFavorite(favorite);
    }
    
    public List<MealFavoriteDto> getAllByUserId(String userId) {
        return repository.findAllByUserId(userId).stream()
                .map(MealFavoriteDto::fromFavorite)
                .collect(Collectors.toList());
    }
    
    public MealFavoriteDto getById(String userId, String favoriteId) {
        MealFavorite favorite = repository.findById(userId, favoriteId);
        return favorite != null ? MealFavoriteDto.fromFavorite(favorite) : null;
    }
    
    public void updateLastUsed(String userId, String favoriteId) {
        MealFavorite favorite = repository.findById(userId, favoriteId);
        if (favorite != null) {
            favorite.setLastUsed(System.currentTimeMillis());
            repository.save(favorite);
        }
    }
    
    public void delete(String userId, String favoriteId) {
        repository.delete(userId, favoriteId);
    }
}

