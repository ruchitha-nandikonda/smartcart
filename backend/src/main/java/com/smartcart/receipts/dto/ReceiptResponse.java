package com.smartcart.receipts.dto;

import com.smartcart.receipts.model.ReceiptLineItem;

import java.util.List;

public record ReceiptResponse(
    String receiptId,
    String storeName,
    Double total,
    String purchasedAt,
    String status,
    List<ReceiptLineItemDto> lineItems,
    String s3KeyOriginal,
    long createdAt
) {
    public static ReceiptResponse fromReceipt(com.smartcart.receipts.model.Receipt receipt) {
        List<ReceiptLineItemDto> lineItemDtos = receipt.getLineItems().stream()
                .map(item -> new ReceiptLineItemDto(
                        item.getRawDesc(),
                        item.getQty(),
                        item.getPrice(),
                        item.getCanonicalProductId(),
                        item.getConfidence()
                ))
                .toList();
        
        return new ReceiptResponse(
                receipt.getReceiptId(),
                receipt.getStoreName(),
                receipt.getTotal(),
                receipt.getPurchasedAt(),
                receipt.getStatus(),
                lineItemDtos,
                receipt.getS3KeyOriginal(),
                receipt.getCreatedAt()
        );
    }
    
    public record ReceiptLineItemDto(
        String rawDesc,
        Double qty,
        Double price,
        String canonicalProductId,
        Double confidence
    ) {}
}

