package com.smartcart.receipts.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmRequest(@NotBlank String s3Key) {}

