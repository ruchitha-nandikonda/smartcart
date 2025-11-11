package com.smartcart.pantry;

import com.smartcart.pantry.dto.CreatePantryItemRequest;
import com.smartcart.pantry.dto.PantryItemDto;
import com.smartcart.pantry.service.PantryService;
import com.smartcart.pantry.service.ExpirationAlertService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pantry")
public class PantryController {
    
    private final PantryService pantryService;
    private final ExpirationAlertService expirationAlertService;
    
    public PantryController(PantryService pantryService, ExpirationAlertService expirationAlertService) {
        this.pantryService = pantryService;
        this.expirationAlertService = expirationAlertService;
    }
    
    @GetMapping
    public ResponseEntity<List<PantryItemDto>> getAll(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(pantryService.getAllByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<PantryItemDto> create(
            @RequestAttribute("userId") String userId,
            @Valid @RequestBody CreatePantryItemRequest request) {
        return ResponseEntity.ok(pantryService.create(userId, request));
    }
    
    @PutMapping("/{productId}")
    public ResponseEntity<PantryItemDto> update(
            @RequestAttribute("userId") String userId,
            @PathVariable String productId,
            @Valid @RequestBody CreatePantryItemRequest request) {
        return ResponseEntity.ok(pantryService.update(userId, productId, request));
    }
    
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> delete(
            @RequestAttribute("userId") String userId,
            @PathVariable String productId) {
        pantryService.delete(userId, productId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/expiring")
    public ResponseEntity<List<PantryItemDto>> getExpiringItems(@RequestAttribute("userId") String userId) {
        List<PantryItemDto> allItems = pantryService.getAllByUserId(userId);
        List<PantryItemDto> expiring = expirationAlertService.getExpiringItems(allItems);
        return ResponseEntity.ok(expiring);
    }
}
