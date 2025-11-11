package com.smartcart.common.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.local.LocalBucketBuilder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Rate limiting filter using Bucket4j
 * Per-endpoint limits:
 * - Auth endpoints: 5 requests/minute
 * - Other endpoints: 100 requests/minute
 */
@Component
@Order(1) // Run before other filters
public class RateLimitingFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);
    
    // In-memory buckets per user/IP (for MVP)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String key = getKey(request);
        Bucket bucket = getBucket(key, request.getRequestURI());
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            logger.warn("Rate limit exceeded for {} on {}", key, request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
        }
    }
    
    private String getKey(HttpServletRequest request) {
        // Use IP address for rate limiting
        String ipAddress = request.getRemoteAddr();
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            ipAddress = forwarded.split(",")[0].trim();
        }
        return ipAddress;
    }
    
    private Bucket getBucket(String key, String path) {
        return buckets.computeIfAbsent(key + ":" + path, k -> {
            // Auth endpoints: stricter limits
            if (path.startsWith("/api/auth/")) {
                return Bucket.builder()
                        .addLimit(Bandwidth.simple(5, Duration.ofMinutes(1)))
                        .build();
            }
            // Other endpoints: more lenient
            return Bucket.builder()
                    .addLimit(Bandwidth.simple(100, Duration.ofMinutes(1)))
                    .build();
        });
    }
}









