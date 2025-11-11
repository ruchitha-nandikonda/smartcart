package com.smartcart.favorites;

import com.smartcart.favorites.dto.MealFavoriteDto;
import com.smartcart.favorites.service.MealFavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class MealFavoriteController {
    
    private final MealFavoriteService favoriteService;
    
    public MealFavoriteController(MealFavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }
    
    @PostMapping
    public ResponseEntity<MealFavoriteDto> create(
            @RequestAttribute("userId") String userId,
            @RequestBody CreateFavoriteRequest request) {
        return ResponseEntity.ok(favoriteService.create(userId, request.name(), request.mealServings()));
    }
    
    @GetMapping
    public ResponseEntity<List<MealFavoriteDto>> getAll(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(favoriteService.getAllByUserId(userId));
    }
    
    @GetMapping("/{favoriteId}")
    public ResponseEntity<MealFavoriteDto> getById(
            @RequestAttribute("userId") String userId,
            @PathVariable String favoriteId) {
        MealFavoriteDto favorite = favoriteService.getById(userId, favoriteId);
        if (favorite == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(favorite);
    }
    
    @PostMapping("/{favoriteId}/use")
    public ResponseEntity<Void> useFavorite(
            @RequestAttribute("userId") String userId,
            @PathVariable String favoriteId) {
        favoriteService.updateLastUsed(userId, favoriteId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<Void> delete(
            @RequestAttribute("userId") String userId,
            @PathVariable String favoriteId) {
        favoriteService.delete(userId, favoriteId);
        return ResponseEntity.noContent().build();
    }
    
    public record CreateFavoriteRequest(String name, Map<String, Integer> mealServings) {}
}

