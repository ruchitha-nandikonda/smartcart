package com.smartcart.shoppinglist.service;

import com.smartcart.optimize.dto.OptimizeResponse;
import com.smartcart.optimize.dto.ShoppingItem;
import com.smartcart.shoppinglist.dto.ShoppingListHistoryDto;
import com.smartcart.shoppinglist.model.ShoppingListHistory;
import com.smartcart.shoppinglist.repository.ShoppingListRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShoppingListService {
    
    private final ShoppingListRepository repository;
    
    public ShoppingListService(ShoppingListRepository repository) {
        this.repository = repository;
    }
    
    public ShoppingListHistoryDto saveShoppingList(String userId, OptimizeResponse optimizeResponse, List<String> meals, Integer totalServings) {
        ShoppingListHistory history = new ShoppingListHistory();
        history.setUserId(userId);
        history.setListId(UUID.randomUUID().toString());
        history.setCreatedAt(System.currentTimeMillis());
        history.setMeals(meals);
        history.setTotalServings(totalServings);
        history.setUsesPantry(optimizeResponse.usesPantry());
        
        // Convert ShoppingItem to ShoppingListItem
        List<ShoppingListHistory.ShoppingListItem> items = optimizeResponse.list().stream()
                .map(item -> new ShoppingListHistory.ShoppingListItem(
                    item.productId(),
                    item.qty(),
                    item.unit(),
                    item.storeId(),
                    item.price()
                ))
                .collect(Collectors.toList());
        history.setItems(items);
        
        history.setCostByStore(optimizeResponse.costByStore());
        
        // Calculate total cost
        double totalCost = optimizeResponse.costByStore().values().stream()
                .mapToDouble(Double::doubleValue)
                .sum();
        history.setTotalCost(totalCost);
        
        repository.save(history);
        return ShoppingListHistoryDto.fromHistory(history);
    }
    
    public List<ShoppingListHistoryDto> getAllByUserId(String userId) {
        return repository.findAllByUserId(userId).stream()
                .map(ShoppingListHistoryDto::fromHistory)
                .collect(Collectors.toList());
    }
    
    public ShoppingListHistoryDto getById(String userId, String listId) {
        ShoppingListHistory history = repository.findById(userId, listId);
        return history != null ? ShoppingListHistoryDto.fromHistory(history) : null;
    }
    
    public void delete(String userId, String listId) {
        repository.delete(userId, listId);
    }
}

