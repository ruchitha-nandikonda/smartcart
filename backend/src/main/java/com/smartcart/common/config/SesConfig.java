package com.smartcart.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;

@Configuration
public class SesConfig {
    
    @Value("${aws.ses.endpoint:}")
    private String sesEndpoint;
    
    @Value("${aws.region:us-east-1}")
    private String awsRegion;
    
    @Value("${aws.ses.enabled:false}")
    private boolean sesEnabled;
    
    @Value("${aws.access-key-id:}")
    private String accessKeyId;
    
    @Value("${aws.secret-access-key:}")
    private String secretAccessKey;
    
    @Bean
    public SesClient sesClient() {
        var builder = SesClient.builder()
                .region(Region.of(awsRegion))
                .httpClient(software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient.builder().build());
        
        // If endpoint is provided (for local SES), use anonymous credentials
        if (sesEndpoint != null && !sesEndpoint.isEmpty()) {
            builder.endpointOverride(java.net.URI.create(sesEndpoint))
                   .credentialsProvider(StaticCredentialsProvider.create(
                           AwsBasicCredentials.create("local", "local")));
        } else if (sesEnabled) {
            // Use explicit credentials if provided, otherwise use default credentials chain
            // DefaultCredentialsProvider checks: environment variables -> AWS credentials file -> IAM role
            if (accessKeyId != null && !accessKeyId.isEmpty() && 
                secretAccessKey != null && !secretAccessKey.isEmpty()) {
                builder.credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)));
            } else {
                // Use default credentials chain (checks environment variables, then AWS credentials file, then IAM role)
                builder.credentialsProvider(DefaultCredentialsProvider.create());
            }
        } else {
            // For local development without AWS, use dummy credentials
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create("dummy", "dummy")));
        }
        
        return builder.build();
    }
}
