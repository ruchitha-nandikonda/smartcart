package com.smartcart.deals.dto;

import java.time.LocalDate;

public record DealDto(
    String storeId,
    String storeName,
    String productId,
    String productName,
    String sizeText,
    Double unitPrice,
    Double promoPrice,
    LocalDate promoEnds,
    String sourceUrl,
    String date
) {}

