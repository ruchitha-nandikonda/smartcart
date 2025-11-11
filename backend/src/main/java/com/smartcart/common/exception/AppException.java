package com.smartcart.common.exception;

/**
 * Base exception for application-specific errors
 */
public class AppException extends RuntimeException {
    private final String userFriendlyMessage;
    private final String errorCode;
    
    public AppException(String message, String userFriendlyMessage, String errorCode) {
        super(message);
        this.userFriendlyMessage = userFriendlyMessage;
        this.errorCode = errorCode;
    }
    
    public AppException(String userFriendlyMessage, String errorCode) {
        super(userFriendlyMessage);
        this.userFriendlyMessage = userFriendlyMessage;
        this.errorCode = errorCode;
    }
    
    public String getUserFriendlyMessage() {
        return userFriendlyMessage;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}

