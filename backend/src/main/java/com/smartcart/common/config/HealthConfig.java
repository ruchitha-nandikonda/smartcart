package com.smartcart.common.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.ListTablesRequest;

@Component
public class HealthConfig implements HealthIndicator {
    
    private final DynamoDbClient dynamoDbClient;
    
    public HealthConfig(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }
    
    @Override
    public Health health() {
        try {
            // Test DynamoDB connection
            dynamoDbClient.listTables(ListTablesRequest.builder().limit(1).build());
            
            return Health.up()
                    .withDetail("database", "DynamoDB - Connected")
                    .withDetail("status", "All systems operational")
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("database", "DynamoDB - Connection failed")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}

