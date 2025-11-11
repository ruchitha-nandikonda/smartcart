package com.smartcart.common.config;

import io.micrometer.cloudwatch2.CloudWatchConfig;
import io.micrometer.cloudwatch2.CloudWatchMeterRegistry;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.config.MeterFilter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import io.micrometer.core.instrument.Clock;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatch.CloudWatchAsyncClient;

import java.time.Duration;
import java.util.Map;

/**
 * Observability configuration with CloudWatch metrics
 */
@Configuration
public class ObservabilityConfig {
    
    @Value("${aws.region:us-east-1}")
    private String awsRegion;
    
    @Value("${aws.cloudwatch.namespace:SmartCart}")
    private String cloudWatchNamespace;
    
    @Value("${observability.enabled:false}")
    private boolean observabilityEnabled;
    
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config()
                .meterFilter(MeterFilter.denyNameStartsWith("jvm"))
                .meterFilter(MeterFilter.denyNameStartsWith("system"))
                .commonTags("application", "smartcart", "environment", "dev");
    }
    
    @Bean
    @ConditionalOnProperty(name = "observability.enabled", havingValue = "true", matchIfMissing = false)
    @Primary
    public CloudWatchMeterRegistry cloudWatchMeterRegistry() {
        CloudWatchConfig cloudWatchConfig = new CloudWatchConfig() {
            private final Map<String, String> configuration = Map.of(
                    "cloudwatch.namespace", cloudWatchNamespace,
                    "cloudwatch.step", Duration.ofMinutes(1).toString()
            );
            
            @Override
            public String get(String key) {
                return configuration.get(key);
            }
        };
        
        CloudWatchAsyncClient cloudWatchAsyncClient = CloudWatchAsyncClient.builder()
                .region(Region.of(awsRegion))
                .build();
        
        return new CloudWatchMeterRegistry(cloudWatchConfig, Clock.SYSTEM, cloudWatchAsyncClient);
    }
    
    @Bean
    @ConditionalOnMissingBean(MeterRegistry.class)
    @Primary
    public SimpleMeterRegistry simpleMeterRegistry() {
        return new SimpleMeterRegistry();
    }
}

