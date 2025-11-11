package com.smartcart.auth.repository;

import com.smartcart.auth.model.User;
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
public class UserRepository {
    
    private final DynamoDbTable<User> userTable;
    private static final String TABLE_NAME = "Users";
    
    @Autowired
    public UserRepository(DynamoDbEnhancedClient enhancedClient) {
        this.userTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(User.class));
    }
    
    public void save(User user) {
        userTable.putItem(user);
    }
    
    public User findById(String userId) {
        Key key = Key.builder().partitionValue(userId).build();
        return userTable.getItem(key);
    }
    
    public User findByEmail(String email) {
        // Note: DynamoDB doesn't support querying by non-key attributes efficiently
        // In production, you'd want a GSI (Global Secondary Index) on email
        // For now, we'll scan (not ideal for production, but works for development)
        return userTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .filter(user -> email.equals(user.getEmail()))
                .findFirst()
                .orElse(null);
    }
    
    public boolean existsByEmail(String email) {
        return findByEmail(email) != null;
    }
    
    public void delete(String userId) {
        Key key = Key.builder().partitionValue(userId).build();
        userTable.deleteItem(key);
    }
}
