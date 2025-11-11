package com.smartcart.deals.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;

public record DealImportRequest(
    @JsonProperty("storeId") String storeId,
    @JsonProperty("storeName") String storeName,
    @JsonProperty("date") String date, // YYYYMMDD format
    @JsonProperty("deals") List<DealItem> deals,
    @JsonProperty("sourceUrl") String sourceUrl
) {
    public record DealItem(
        @JsonProperty("productId") String productId,
        @JsonProperty("productName") String productName,
        @JsonProperty("sizeText") String sizeText,
        @JsonProperty("unitPrice") Double unitPrice,
        @JsonProperty("promoPrice") Double promoPrice,
        @JsonProperty("promoEnds") String promoEnds // ISO date format
    ) {}
}

