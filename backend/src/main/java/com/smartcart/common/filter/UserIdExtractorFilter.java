package com.smartcart.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class UserIdExtractorFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Extract userId from token (format: "token-{userId}")
            if (token.startsWith("token-")) {
                String userId = token.substring(6);
                request.setAttribute("userId", userId);
                // Also add as header for convenience
                response.setHeader("X-User-Id", userId);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}

