package com.smartcart.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.net.URI;

@Configuration
public class DynamoConfig {
    
    @Value("${aws.dynamo.endpoint:}")
    private String dynamoEndpoint;
    
    @Value("${aws.region:us-east-1}")
    private String awsRegion;
    
    @Bean
    public DynamoDbClient dynamoDbClient() {
        var builder = DynamoDbClient.builder()
                .region(Region.of(awsRegion))
                .httpClient(software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient.builder().build());
        
        // If endpoint is provided (for local DynamoDB), use anonymous credentials
        if (dynamoEndpoint != null && !dynamoEndpoint.isEmpty()) {
            builder.endpointOverride(URI.create(dynamoEndpoint))
                   .credentialsProvider(StaticCredentialsProvider.create(
                           AwsBasicCredentials.create("local", "local")));
        } else {
            // For local development without AWS, use dummy credentials
            // This allows the app to start without real AWS credentials
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create("dummy", "dummy")));
        }
        
        return builder.build();
    }
    
    @Bean
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
    }
}
