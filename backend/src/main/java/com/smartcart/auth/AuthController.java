package com.smartcart.auth;

import com.smartcart.auth.dto.AuthResponse;
import com.smartcart.auth.dto.ForgotPasswordRequest;
import com.smartcart.auth.dto.LoginRequest;
import com.smartcart.auth.dto.RefreshTokenRequest;
import com.smartcart.auth.dto.RegisterRequest;
import com.smartcart.auth.dto.RegisterResponse;
import com.smartcart.auth.dto.ResendOTPRequest;
import com.smartcart.auth.dto.ResetPasswordRequest;
import com.smartcart.auth.dto.VerifyOTPRequest;
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
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("Register request for email: {}", request.email());
        try {
            RegisterResponse response = authService.register(request.email(), request.password());
            logger.info("Registration OTP sent to email: {}", request.email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in register endpoint", e);
            throw e; // Let GlobalExceptionHandler catch it
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        logger.info("OTP verification request for email: {}", request.email());
        try {
            AuthResponse response = authService.verifyOTP(request.email(), request.otp());
            logger.info("OTP verification successful for email: {}", request.email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in verify-otp endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/resend-otp")
    public ResponseEntity<RegisterResponse> resendOTP(@Valid @RequestBody ResendOTPRequest request) {
        logger.info("Resend OTP request for email: {}", request.email());
        try {
            RegisterResponse response = authService.resendOTP(request.email());
            logger.info("OTP resent to email: {}", request.email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in resend-otp endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        logger.info("Forgot password request for email: {}", request.email());
        try {
            authService.forgotPassword(request.email());
            logger.info("Password reset email sent to: {}", request.email());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error in forgot-password endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("Reset password request for email: {}", request.email());
        try {
            authService.resetPassword(request.email(), request.otp(), request.newPassword());
            logger.info("Password reset successful for email: {}", request.email());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error in reset-password endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login request for email: {}", request.email());
        try {
            AuthResponse response = authService.login(request.email(), request.password());
            logger.info("Login successful for email: {}", request.email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in login endpoint: {}", e.getMessage(), e);
            throw e; // Let GlobalExceptionHandler catch it
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
            throw e; // Let GlobalExceptionHandler catch it
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