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
    
    @Value("${aws.access-key-id:}")
    private String awsAccessKeyId;
    
    @Value("${aws.secret-access-key:}")
    private String awsSecretAccessKey;
    
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
        } else if (awsAccessKeyId != null && !awsAccessKeyId.trim().isEmpty() &&
                   awsSecretAccessKey != null && !awsSecretAccessKey.trim().isEmpty()) {
            // Use provided AWS credentials for production
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(awsAccessKeyId, awsSecretAccessKey)));
        } else {
            // Try to use default credentials provider (from environment variables, IAM role, etc.)
            // This works on AWS EC2, ECS, Lambda, or when AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are set
            builder.credentialsProvider(DefaultCredentialsProvider.create());
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
