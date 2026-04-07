package com.smartcart.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 64, message = "Username must be 3–64 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._+@-]+$", message = "Use letters, numbers, and . _ + - @ only (no spaces)")
    String username,
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password
) {}
