package com.smartcart.receipts.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Product catalog structure from catalog.json
 */
public record ProductCatalog(
    @JsonProperty("products") List<Product> products
) {
    public record Product(
        @JsonProperty("id") String id,
        @JsonProperty("name") String name,
        @JsonProperty("sizeGrams") Integer sizeGrams,
        @JsonProperty("categories") List<String> categories,
        @JsonProperty("synonyms") List<String> synonyms,
        @JsonProperty("brandSynonyms") List<String> brandSynonyms
    ) {}
}









