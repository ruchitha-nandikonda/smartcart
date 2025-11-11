package com.smartcart.common.config;

import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

/**
 * Structured JSON logging configuration
 * Format: {timestamp, level, logger, message, requestId, userId, endpoint, status, latency}
 * Configured via logback-spring.xml
 */
@Configuration
public class LoggingConfig {
    // Logging configuration is handled via logback-spring.xml
    // For production, consider adding logstash-logback-encoder dependency for JSON logs
}

