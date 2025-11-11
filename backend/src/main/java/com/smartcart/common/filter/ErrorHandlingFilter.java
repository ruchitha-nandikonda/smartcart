package com.smartcart.common.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcart.common.exception.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class ErrorHandlingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(ErrorHandlingFilter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Exception caught in ErrorHandlingFilter: {}", e.getMessage(), e);
            handleException(e, request, response);
        }
    }

    private void handleException(Exception e, HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String message = extractMessage(e);
        ErrorResponse errorResponse = new ErrorResponse(
            message,
            "INTERNAL_ERROR",
            LocalDateTime.now(),
            request.getRequestURI()
        );

        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        try {
            objectMapper.writeValue(response.getWriter(), errorResponse);
            response.getWriter().flush();
        } catch (IOException ioException) {
            logger.error("Failed to write error response", ioException);
            // Fallback: write plain text
            response.setContentType(MediaType.TEXT_PLAIN_VALUE);
            response.getWriter().write("{\"message\":\"" + message + "\",\"errorCode\":\"INTERNAL_ERROR\"}");
            response.getWriter().flush();
        }
    }

    private String extractMessage(Exception e) {
        String message = e.getMessage();
        if (message == null || message.isEmpty()) {
            return "Something went wrong. Please try again later.";
        }
        
        // Map common error messages
        if (message.contains("Invalid password") || message.contains("password")) {
            return "Incorrect password. Please check your password and try again.";
        }
        if (message.contains("No account found")) {
            return "No account found with this email. Please sign up to create an account.";
        }
        if (message.contains("Cannot do operations on a non-existent table")) {
            return "Database table not found. Please ensure DynamoDB is running and tables are initialized.";
        }
        if (message.contains("The security token included in the request is invalid")) {
            return "Database connection error. Please check DynamoDB configuration.";
        }
        
        return message;
    }
}

