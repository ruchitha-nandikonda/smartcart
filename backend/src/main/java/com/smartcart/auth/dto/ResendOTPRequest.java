package com.smartcart.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendOTPRequest(
    @NotBlank @Email String email
) {}





