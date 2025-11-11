package com.smartcart.auth.filter;

import com.smartcart.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    
    private final JwtService jwtService;
    
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        String token = null;
        String userId = null;
        
        // Extract token from Authorization header
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            token = authHeader.substring(BEARER_PREFIX.length());
            try {
                userId = jwtService.extractUserId(token);
                
                // Validate token
                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (jwtService.validateToken(token, userId)) {
                        String email = jwtService.extractEmail(token);
                        
                        // Create authentication object
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        // Set userId as request attribute for downstream filters/controllers
                        request.setAttribute("userId", userId);
                        request.setAttribute("email", email);
                        
                        logger.debug("JWT authentication successful for user: {}", userId);
                    } else {
                        logger.debug("Invalid JWT token");
                    }
                }
            } catch (Exception e) {
                logger.debug("JWT parsing failed: {}", e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Skip JWT filter for public endpoints only
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Public auth endpoints that don't need JWT
        if (path.startsWith("/api/auth/")) {
            return path.equals("/api/auth/register") ||
                   path.equals("/api/auth/login") ||
                   path.equals("/api/auth/verify-otp") ||
                   path.equals("/api/auth/resend-otp") ||
                   path.equals("/api/auth/forgot-password") ||
                   path.equals("/api/auth/reset-password") ||
                   path.equals("/api/auth/refresh");
        }
        
        // Other public endpoints
        return path.startsWith("/actuator/") || 
               path.equals("/") || 
               path.equals("/error");
    }
}

