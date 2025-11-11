package com.smartcart.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.UUID;

/**
 * Logs all API requests with request ID, user ID, endpoint, method, status, and duration
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip logging for actuator endpoints to reduce noise
        if (request.getRequestURI().startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Generate request ID for tracing
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", requestId);
        
        // Extract user ID if available
        String userId = extractUserId(request);
        if (userId != null) {
            MDC.put("userId", userId.substring(0, Math.min(8, userId.length())));
        }
        
        long startTime = System.currentTimeMillis();
        
        // Wrap request/response to cache content for logging
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        
        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = wrappedResponse.getStatus();
            
            // Log request details
            logger.info("API Request: {} {} | Status: {} | Duration: {}ms | User: {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    status,
                    duration,
                    userId != null ? userId.substring(0, Math.min(8, userId.length())) : "anonymous"
            );
            
            // Log slow requests
            if (duration > 1000) {
                logger.warn("Slow request detected: {} {} took {}ms", 
                        request.getMethod(), request.getRequestURI(), duration);
            }
            
            // Log errors
            if (status >= 400) {
                logger.error("Error response: {} {} | Status: {} | Duration: {}ms",
                        request.getMethod(), request.getRequestURI(), status, duration);
            }
            
            // Copy response body back
            wrappedResponse.copyBodyToResponse();
            
            // Clear MDC
            MDC.clear();
        }
    }
    
    private String extractUserId(HttpServletRequest request) {
        // Try to get userId from header (set by UserIdExtractorFilter)
        String userId = (String) request.getAttribute("userId");
        if (userId != null) {
            return userId;
        }
        
        // Try to extract from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer token-")) {
            return authHeader.substring("Bearer token-".length());
        }
        
        return null;
    }
}

