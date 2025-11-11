package com.smartcart.common.config;

import com.smartcart.common.filter.ErrorHandlingFilter;
import com.smartcart.common.filter.RequestLoggingFilter;
import com.smartcart.common.filter.UserIdExtractorFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {
    
    @Bean
    public UserIdExtractorFilter userIdExtractorFilter() {
        return new UserIdExtractorFilter();
    }
    
    @Bean
    public RequestLoggingFilter requestLoggingFilter() {
        return new RequestLoggingFilter();
    }
    
    @Bean
    public ErrorHandlingFilter errorHandlingFilter() {
        return new ErrorHandlingFilter();
    }
    
    @Bean
    public FilterRegistrationBean<ErrorHandlingFilter> errorHandlingFilterRegistration(ErrorHandlingFilter filter) {
        FilterRegistrationBean<ErrorHandlingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(-100); // Run before other filters to catch all errors
        return registrationBean;
    }
    
    @Bean
    public FilterRegistrationBean<UserIdExtractorFilter> userIdExtractorFilterRegistration(UserIdExtractorFilter filter) {
        FilterRegistrationBean<UserIdExtractorFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/api/pantry/*", "/api/optimize/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
    
    @Bean
    public FilterRegistrationBean<RequestLoggingFilter> requestLoggingFilterRegistration(RequestLoggingFilter filter) {
        FilterRegistrationBean<RequestLoggingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(0); // Run first to log all requests
        return registrationBean;
    }
}

