package com.smartcart.shoppinglist.repository;

import com.smartcart.shoppinglist.model.ShoppingListHistory;
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
public class ShoppingListRepository {
    
    private final DynamoDbTable<ShoppingListHistory> shoppingListTable;
    private static final String TABLE_NAME = "ShoppingLists";
    
    @Autowired
    public ShoppingListRepository(DynamoDbEnhancedClient enhancedClient) {
        this.shoppingListTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(ShoppingListHistory.class));
    }
    
    public void save(ShoppingListHistory shoppingList) {
        shoppingListTable.putItem(shoppingList);
    }
    
    public ShoppingListHistory findById(String userId, String listId) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(listId)
                .build();
        return shoppingListTable.getItem(key);
    }
    
    public List<ShoppingListHistory> findAllByUserId(String userId) {
        return shoppingListTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .filter(list -> userId.equals(list.getUserId()))
                .sorted((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()))
                .collect(Collectors.toList());
    }
    
    public void delete(String userId, String listId) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(listId)
                .build();
        shoppingListTable.deleteItem(key);
    }
    
    public void deleteAllByUserId(String userId) {
        List<ShoppingListHistory> lists = findAllByUserId(userId);
        for (ShoppingListHistory list : lists) {
            shoppingListTable.deleteItem(list);
        }
    }
}

