package com.smartcart.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyOTPRequest(
    @NotBlank @Email String email,
    @NotBlank @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be 6 digits") String otp
) {}





