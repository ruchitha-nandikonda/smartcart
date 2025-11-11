package com.smartcart.receipts.util;

import com.smartcart.receipts.model.Receipt;
import com.smartcart.receipts.model.ReceiptLineItem;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility class to generate test receipt data for development/testing
 */
public class TestReceiptGenerator {
    
    public static Receipt generateSampleReceipt(String userId) {
        Receipt receipt = new Receipt(userId, "test-receipt-001");
        receipt.setStoreName("Smart Mart Grocery");
        receipt.setTotal(31.28);
        receipt.setPurchasedAt(java.time.LocalDate.now().toString());
        receipt.setStatus("processed");
        receipt.setS3KeyOriginal("receipts/" + userId + "/test-receipt-001.jpg");
        
        List<ReceiptLineItem> lineItems = new ArrayList<>();
        
        // Milk
        ReceiptLineItem milk = new ReceiptLineItem("Milk - 1 Gallon", 1.0, 3.49);
        milk.setCanonicalProductId("milk");
        milk.setConfidence(0.95);
        lineItems.add(milk);
        
        // Bread
        ReceiptLineItem bread = new ReceiptLineItem("Whole Wheat Bread", 1.0, 2.99);
        bread.setCanonicalProductId("bread");
        bread.setConfidence(0.90);
        lineItems.add(bread);
        
        // Eggs
        ReceiptLineItem eggs = new ReceiptLineItem("Large Eggs - 12 count", 1.0, 4.29);
        eggs.setCanonicalProductId("eggs");
        eggs.setConfidence(0.92);
        lineItems.add(eggs);
        
        // Chicken
        ReceiptLineItem chicken = new ReceiptLineItem("Chicken Breast - 2 lbs", 2.0, 9.98);
        chicken.setCanonicalProductId("chicken");
        chicken.setConfidence(0.88);
        lineItems.add(chicken);
        
        // Tomatoes
        ReceiptLineItem tomatoes = new ReceiptLineItem("Tomatoes - 2 lbs", 2.0, 5.98);
        tomatoes.setCanonicalProductId("tomatoes");
        tomatoes.setConfidence(0.85);
        lineItems.add(tomatoes);
        
        // Onions
        ReceiptLineItem onions = new ReceiptLineItem("Onions - 3 lbs", 3.0, 2.97);
        onions.setCanonicalProductId("onions");
        onions.setConfidence(0.87);
        lineItems.add(onions);
        
        // Bananas
        ReceiptLineItem bananas = new ReceiptLineItem("Bananas - 2 lbs", 2.0, 1.58);
        bananas.setCanonicalProductId("bananas");
        bananas.setConfidence(0.90);
        lineItems.add(bananas);
        
        receipt.setLineItems(lineItems);
        
        return receipt;
    }
    
    /**
     * Creates a simple text representation of a receipt for manual testing
     */
    public static String getReceiptText() {
        return """
            SMART MART GROCERY
            123 Main Street
            City, State 12345
            
            Date: %s
            
            Milk - 1 Gallon          $3.49
            Whole Wheat Bread        $2.99
            Large Eggs - 12 count    $4.29
            Chicken Breast - 2 lbs   $9.98
            Tomatoes - 2 lbs         $5.98
            Onions - 3 lbs           $2.97
            Bananas - 2 lbs          $1.58
            
            TOTAL:                   $31.28
            
            Thank you for shopping with us!
            """.formatted(java.time.LocalDate.now().toString());
    }
}

