package com.smartcart.auth;

import com.smartcart.auth.dto.AuthResponse;
import com.smartcart.auth.dto.LoginRequest;
import com.smartcart.auth.dto.RefreshTokenRequest;
import com.smartcart.auth.dto.RegisterRequest;
import com.smartcart.auth.dto.ResetPasswordRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("Register request for username: {}", request.username());
        try {
            AuthResponse response = authService.register(request.username(), request.password());
            logger.info("Registration successful for username: {}", request.username());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in register endpoint", e);
            throw e;
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("Reset password request for username: {}", request.username());
        try {
            authService.resetPassword(request.username(), request.newPassword());
            logger.info("Password reset successful for username: {}", request.username());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error in reset-password endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login request for username: {}", request.username());
        try {
            AuthResponse response = authService.login(request.username(), request.password());
            logger.info("Login successful for username: {}", request.username());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in login endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        logger.info("Token refresh request");
        try {
            AuthResponse response = authService.refreshToken(request.refreshToken());
            logger.info("Token refresh successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in refresh endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(@RequestAttribute("userId") String userId) {
        logger.info("Delete account request for userId: {}", userId);
        try {
            authService.deleteAccount(userId);
            logger.info("Account deleted successfully for userId: {}", userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error in delete-account endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
}
