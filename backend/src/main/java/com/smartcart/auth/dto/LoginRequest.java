package com.smartcart.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 64)
    @Pattern(regexp = "^[a-zA-Z0-9._+@-]+$", message = "Invalid username")
    String username,
    
    @NotBlank(message = "Password is required")
    String password
) {}
