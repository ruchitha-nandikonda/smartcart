package com.smartcart.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.textract.TextractClient;

@Configuration
public class TextractConfig {
    
    @Value("${aws.region:us-east-1}")
    private String awsRegion;
    
    @Bean
    public TextractClient textractClient() {
        // Textract only works with real AWS, not local
        // For local dev, use dummy credentials (TextractService will handle errors gracefully)
        return TextractClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(software.amazon.awssdk.auth.credentials.StaticCredentialsProvider.create(
                        software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create("dummy", "dummy")))
                .httpClient(software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient.builder().build())
                .build();
    }
}

