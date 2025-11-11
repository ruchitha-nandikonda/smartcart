package com.smartcart.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthResponse(
    @JsonProperty("accessToken") String accessToken,
    @JsonProperty("refreshToken") String refreshToken,
    @JsonProperty("userId") String userId,
    @JsonProperty("email") String email
) {}