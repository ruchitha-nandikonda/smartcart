package com.smartcart.receipts.repository;

import com.smartcart.receipts.model.Receipt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class ReceiptRepository {
    
    private final DynamoDbTable<Receipt> receiptTable;
    private static final String TABLE_NAME = "Receipts";
    private static final String RECEIPT_PREFIX = "RECEIPT#";
    
    @Autowired
    public ReceiptRepository(DynamoDbEnhancedClient enhancedClient) {
        this.receiptTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(Receipt.class));
    }
    
    public void save(Receipt receipt) {
        // Ensure sortKey is set properly
        if (receipt.getSortKey() == null || receipt.getSortKey().isEmpty()) {
            String receiptId = receipt.getReceiptId();
            if (receiptId != null && !receiptId.isEmpty()) {
                receipt.setSortKey(RECEIPT_PREFIX + receiptId);
            }
        }
        receiptTable.putItem(receipt);
    }
    
    public Receipt findById(String userId, String receiptId) {
        String sortKey = RECEIPT_PREFIX + receiptId;
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(sortKey)
                .build();
        return receiptTable.getItem(key);
    }
    
    public List<Receipt> findAllByUserId(String userId) {
        // Query all receipts for this user (all items with sortKey starting with RECEIPT#)
        return receiptTable.query(r -> r.queryConditional(
                    QueryConditional.keyEqualTo(k -> k.partitionValue(userId))
                ))
                .items()
                .stream()
                .filter(receipt -> receipt.getSortKey() != null && receipt.getSortKey().startsWith(RECEIPT_PREFIX))
                .sorted((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()))
                .collect(Collectors.toList());
    }
    
    public void delete(String userId, String receiptId) {
        String sortKey = RECEIPT_PREFIX + receiptId;
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(sortKey)
                .build();
        receiptTable.deleteItem(key);
    }
    
    public void deleteAllByUserId(String userId) {
        List<Receipt> receipts = findAllByUserId(userId);
        for (Receipt receipt : receipts) {
            receiptTable.deleteItem(receipt);
        }
    }
}

