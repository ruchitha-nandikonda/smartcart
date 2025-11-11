package com.smartcart.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException e, HttpServletRequest request) {
        logger.error("Application error: {}", e.getMessage(), e);
        
        ErrorResponse error = ErrorResponse.of(
            e.getUserFriendlyMessage(),
            e.getErrorCode(),
            request.getRequestURI()
        );
        
        HttpStatus status = determineHttpStatus(e.getErrorCode());
        return ResponseEntity.status(status).body(error);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        String message = e.getMessage();
        String userFriendlyMessage = getFriendlyMessage(message);
        String errorCode = getErrorCode(message);
        
        logger.error("Runtime error: {}", message, e);
        logger.error("RuntimeException type: {}", e.getClass().getName());
        
        ErrorResponse error = ErrorResponse.of(
            userFriendlyMessage,
            errorCode,
            request.getRequestURI()
        );
        
        HttpStatus status = determineHttpStatus(errorCode);
        return ResponseEntity
            .status(status)
            .header("Content-Type", "application/json")
            .body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException e, HttpServletRequest request) {
        
        Map<String, String> fieldErrors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fieldError -> fieldError.getDefaultMessage() != null 
                    ? fieldError.getDefaultMessage() 
                    : "Invalid value"
            ));
        
        String message = "Please check your input: " + String.join(", ", fieldErrors.values());
        
        logger.warn("Validation error: {}", fieldErrors);
        
        ErrorResponse error = ErrorResponse.of(
            message,
            "VALIDATION_ERROR",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e, HttpServletRequest request) {
        logger.error("Unexpected error: {}", e.getMessage(), e);
        logger.error("Exception type: {}", e.getClass().getName(), e);
        
        // Try to extract a meaningful message from the exception
        String message = e.getMessage();
        if (message == null || message.isEmpty()) {
            message = "Something went wrong. Please try again later.";
        } else if (message.contains("Cannot do operations on a non-existent table")) {
            message = "Database table not found. Please ensure DynamoDB is running and tables are initialized.";
        } else if (message.contains("The security token included in the request is invalid")) {
            message = "Database connection error. Please check DynamoDB configuration.";
        }
        
        ErrorResponse error = ErrorResponse.of(
            message,
            "INTERNAL_ERROR",
            request.getRequestURI()
        );
        
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .header("Content-Type", "application/json")
            .body(error);
    }
    
    private String getFriendlyMessage(String technicalMessage) {
        if (technicalMessage == null || technicalMessage.isEmpty()) {
            return "An unexpected error occurred. Please try again.";
        }
        
        // Check for specific error patterns first (most specific to least specific)
        if (technicalMessage.contains("Invalid password") || technicalMessage.contains("password")) {
            return "Incorrect password. Please check your password and try again.";
        }
        
        if (technicalMessage.contains("No account found")) {
            return "No account found with this email. Please sign up to create an account.";
        }
        
        if (technicalMessage.contains("User already exists")) {
            return "An account with this email already exists. Please sign in instead.";
        }
        
        if (technicalMessage.contains("Invalid credentials") || technicalMessage.contains("credentials")) {
            return "Email or password is incorrect. Please check your credentials and try again.";
        }
        
        // Return original message if no mapping found
        return technicalMessage;
    }
    
    private String getErrorCode(String message) {
        if (message == null) {
            return "UNKNOWN_ERROR";
        }
        
        if (message.contains("Invalid") || message.contains("credentials") || 
            message.contains("password") || message.contains("No account found")) {
            return "AUTH_ERROR";
        }
        
        if (message.contains("User already exists")) {
            return "USER_EXISTS";
        }
        
        if (message.contains("not found")) {
            return "NOT_FOUND";
        }
        
        return "BAD_REQUEST";
    }
    
    private HttpStatus determineHttpStatus(String errorCode) {
        return switch (errorCode) {
            case "AUTH_ERROR", "USER_EXISTS" -> HttpStatus.UNAUTHORIZED;
            case "NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "VALIDATION_ERROR" -> HttpStatus.BAD_REQUEST;
            case "INTERNAL_ERROR" -> HttpStatus.INTERNAL_SERVER_ERROR;
            default -> HttpStatus.BAD_REQUEST;
        };
    }
}