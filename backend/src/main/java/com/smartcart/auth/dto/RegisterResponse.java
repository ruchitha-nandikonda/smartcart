package com.smartcart.auth.dto;

public record RegisterResponse(
    String message,
    String otpCode  // Only included in development mode
) {}





