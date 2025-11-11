package com.smartcart.common.exception;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomErrorController implements ErrorController {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomErrorController.class);
    
    @RequestMapping("/error")
    public ResponseEntity<ErrorResponse> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        String errorMessage = "An error occurred";
        
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            httpStatus = HttpStatus.valueOf(statusCode);
        }
        
        if (exception != null && exception instanceof Exception) {
            Exception e = (Exception) exception;
            errorMessage = e.getMessage();
            logger.error("Error handled by ErrorController: {}", errorMessage, e);
        } else if (message != null) {
            errorMessage = message.toString();
        }
        
        // Map to user-friendly message
        if (errorMessage == null || errorMessage.isEmpty()) {
            errorMessage = "Something went wrong. Please try again later.";
        } else if (errorMessage.contains("Invalid password") || errorMessage.contains("password")) {
            errorMessage = "Incorrect password. Please check your password and try again.";
        } else if (errorMessage.contains("No account found")) {
            errorMessage = "No account found with this email. Please sign up to create an account.";
        }
        
        ErrorResponse error = ErrorResponse.of(
            errorMessage,
            "INTERNAL_ERROR",
            request.getRequestURI()
        );
        
        return ResponseEntity
            .status(httpStatus)
            .header("Content-Type", "application/json")
            .body(error);
    }
}

