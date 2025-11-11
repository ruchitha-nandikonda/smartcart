package com.smartcart.favorites.repository;

import com.smartcart.favorites.model.MealFavorite;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class MealFavoriteRepository {
    
    private final DynamoDbTable<MealFavorite> favoriteTable;
    private static final String TABLE_NAME = "MealFavorites";
    
    @Autowired
    public MealFavoriteRepository(DynamoDbEnhancedClient enhancedClient) {
        this.favoriteTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(MealFavorite.class));
    }
    
    public void save(MealFavorite favorite) {
        favoriteTable.putItem(favorite);
    }
    
    public MealFavorite findById(String userId, String favoriteId) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(favoriteId)
                .build();
        return favoriteTable.getItem(key);
    }
    
    public List<MealFavorite> findAllByUserId(String userId) {
        return favoriteTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .filter(fav -> userId.equals(fav.getUserId()))
                .sorted((a, b) -> Long.compare(b.getLastUsed() != null ? b.getLastUsed() : 0,
                                               a.getLastUsed() != null ? a.getLastUsed() : 0))
                .collect(Collectors.toList());
    }
    
    public void delete(String userId, String favoriteId) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(favoriteId)
                .build();
        favoriteTable.deleteItem(key);
    }
    
    public void deleteAllByUserId(String userId) {
        List<MealFavorite> favorites = findAllByUserId(userId);
        for (MealFavorite favorite : favorites) {
            favoriteTable.deleteItem(favorite);
        }
    }
}

