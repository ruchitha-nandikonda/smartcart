package com.smartcart.pantry.service;

import com.smartcart.pantry.dto.CreatePantryItemRequest;
import com.smartcart.pantry.dto.PantryItemDto;
import com.smartcart.pantry.model.PantryItem;
import com.smartcart.pantry.repository.PantryRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PantryService {
    
    private final PantryRepository pantryRepository;
    
    public PantryService(PantryRepository pantryRepository) {
        this.pantryRepository = pantryRepository;
    }
    
    public PantryItemDto create(String userId, CreatePantryItemRequest request) {
        String productId = UUID.randomUUID().toString();
        PantryItem item = new PantryItem();
        item.setUserId(userId);
        item.setProductId(productId); // This will set sortKey to ITEM#<productId>
        item.setName(request.name());
        item.setQuantity(request.quantity());
        item.setUnit(request.unit() != null ? request.unit() : "unit");
        item.setLastUpdated(Instant.now().toString());
        item.setEstExpiry(request.estExpiry());
        item.setSource("manual");
        item.setPackSize(request.packSize());
        item.setCategories(request.categories());
        
        pantryRepository.save(item);
        return toDto(item);
    }
    
    public List<PantryItemDto> getAllByUserId(String userId) {
        return pantryRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public PantryItemDto update(String userId, String productId, CreatePantryItemRequest request) {
        PantryItem item = pantryRepository.findByUserIdAndProductId(userId, productId);
        if (item == null) {
            throw new RuntimeException("Pantry item not found");
        }
        
        item.setName(request.name());
        item.setQuantity(request.quantity());
        item.setUnit(request.unit() != null ? request.unit() : "unit");
        item.setLastUpdated(Instant.now().toString());
        item.setEstExpiry(request.estExpiry());
        item.setPackSize(request.packSize());
        item.setCategories(request.categories());
        
        pantryRepository.save(item);
        return toDto(item);
    }
    
    public void delete(String userId, String productId) {
        PantryItem item = pantryRepository.findByUserIdAndProductId(userId, productId);
        if (item == null) {
            throw new RuntimeException("Pantry item not found");
        }
        pantryRepository.delete(userId, productId);
    }
    
    private PantryItemDto toDto(PantryItem item) {
        return new PantryItemDto(
            item.getProductId(),
            item.getName(),
            item.getQuantity(),
            item.getUnit(),
            item.getLastUpdated(),
            item.getEstExpiry(),
            item.getSource(),
            item.getPackSize(),
            item.getCategories()
        );
    }
}
