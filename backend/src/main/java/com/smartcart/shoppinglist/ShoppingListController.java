package com.smartcart.shoppinglist;

import com.smartcart.shoppinglist.dto.ShoppingListHistoryDto;
import com.smartcart.shoppinglist.service.ShoppingListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shopping-lists")
public class ShoppingListController {
    
    private final ShoppingListService shoppingListService;
    
    public ShoppingListController(ShoppingListService shoppingListService) {
        this.shoppingListService = shoppingListService;
    }
    
    @GetMapping
    public ResponseEntity<List<ShoppingListHistoryDto>> getAll(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(shoppingListService.getAllByUserId(userId));
    }
    
    @GetMapping("/{listId}")
    public ResponseEntity<ShoppingListHistoryDto> getById(
            @RequestAttribute("userId") String userId,
            @PathVariable String listId) {
        ShoppingListHistoryDto list = shoppingListService.getById(userId, listId);
        if (list == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(list);
    }
    
    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> delete(
            @RequestAttribute("userId") String userId,
            @PathVariable String listId) {
        shoppingListService.delete(userId, listId);
        return ResponseEntity.noContent().build();
    }
}

