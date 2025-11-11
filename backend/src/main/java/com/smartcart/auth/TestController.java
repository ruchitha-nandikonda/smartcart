package com.smartcart.auth;

import com.smartcart.common.exception.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping("/error")
    public ResponseEntity<ErrorResponse> testError() {
        throw new RuntimeException("Test error message - Invalid password. Please try again.");
    }
    
    @GetMapping("/success")
    public ResponseEntity<String> testSuccess() {
        return ResponseEntity.ok("Backend is working!");
    }
}

