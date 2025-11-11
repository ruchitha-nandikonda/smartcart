package com.smartcart.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record ErrorResponse(
    String message,
    String errorCode,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime timestamp,
    String path
) {
    public static ErrorResponse of(String message, String errorCode, String path) {
        return new ErrorResponse(message, errorCode, LocalDateTime.now(), path);
    }
}

