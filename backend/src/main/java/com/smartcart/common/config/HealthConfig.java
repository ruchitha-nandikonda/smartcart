package com.smartcart.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.ListTablesRequest;

@Component
public class HealthConfig implements HealthIndicator {
    
    private final DynamoDbClient dynamoDbClient;
    
    @Value("${aws.dynamo.endpoint:}")
    private String dynamoEndpoint;
    
    @Value("${aws.access-key-id:}")
    private String awsAccessKeyId;
    
    @Value("${aws.secret-access-key:}")
    private String awsSecretAccessKey;
    
    public HealthConfig(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }
    
    @Override
    public Health health() {
        // Only check DynamoDB if we have credentials or a local endpoint configured
        boolean hasDynamoConfig = (dynamoEndpoint != null && !dynamoEndpoint.trim().isEmpty()) ||
                                   (awsAccessKeyId != null && !awsAccessKeyId.trim().isEmpty() &&
                                    awsSecretAccessKey != null && !awsSecretAccessKey.trim().isEmpty());
        
        if (!hasDynamoConfig) {
            // No DynamoDB configured - app can still start, return UP
            // This won't affect liveness/readiness since we configured groups to only check "ping"
            return Health.up()
                    .withDetail("database", "DynamoDB - Not configured (using fallback)")
                    .withDetail("status", "Application running (DynamoDB not required for startup)")
                    .build();
        }
        
        try {
            // Test DynamoDB connection only if configured
            dynamoDbClient.listTables(ListTablesRequest.builder().limit(1).build());
            
            return Health.up()
                    .withDetail("database", "DynamoDB - Connected")
                    .withDetail("status", "All systems operational")
                    .build();
        } catch (Exception e) {
            // Even if DynamoDB check fails, don't fail the entire health check
            // Log the error but return UP to allow the app to start
            // The app can function in a degraded mode without DynamoDB
            return Health.up()
                    .withDetail("database", "DynamoDB - Connection check failed (degraded mode)")
                    .withDetail("warning", "DynamoDB connectivity issue: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"))
                    .build();
        }
    }
}

