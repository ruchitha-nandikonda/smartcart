package com.smartcart.auth;

import com.smartcart.auth.dto.AuthResponse;
import com.smartcart.auth.dto.RegisterResponse;
import com.smartcart.auth.model.OTP;
import com.smartcart.auth.model.User;
import com.smartcart.auth.repository.OTPRepository;
import com.smartcart.auth.repository.UserRepository;
import com.smartcart.auth.service.EmailService;
import com.smartcart.auth.service.JwtService;
import com.smartcart.favorites.repository.MealFavoriteRepository;
import com.smartcart.pantry.repository.PantryRepository;
import com.smartcart.receipts.repository.ReceiptRepository;
import com.smartcart.shoppinglist.repository.ShoppingListRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_OTP_ATTEMPTS = 5;
    
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final OTPRepository otpRepository;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PantryRepository pantryRepository;
    private final ReceiptRepository receiptRepository;
    private final MealFavoriteRepository mealFavoriteRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final SecureRandom random = new SecureRandom();
    
    @Value("${aws.ses.enabled:false}")
    private boolean sesEnabled;
    
    @Value("${gmail.enabled:false}")
    private boolean gmailEnabled;
    
    public AuthService(PasswordEncoder passwordEncoder, UserRepository userRepository, 
                      OTPRepository otpRepository, JwtService jwtService, EmailService emailService,
                      PantryRepository pantryRepository, ReceiptRepository receiptRepository,
                      MealFavoriteRepository mealFavoriteRepository, ShoppingListRepository shoppingListRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.pantryRepository = pantryRepository;
        this.receiptRepository = receiptRepository;
        this.mealFavoriteRepository = mealFavoriteRepository;
        this.shoppingListRepository = shoppingListRepository;
    }
    
    public RegisterResponse register(String email, String password) {
        logger.info("Starting registration for email: {}", email);
        try {
            if (userRepository.existsByEmail(email)) {
                logger.warn("Registration failed: User already exists - {}", email);
                throw new RuntimeException("User already exists");
            }
            
            logger.info("Creating user account for: {}", email);
            String userId = UUID.randomUUID().toString();
            String hashedPassword = passwordEncoder.encode(password);
            
            User user = new User(userId, email, hashedPassword);
            userRepository.save(user);
            logger.info("User account created successfully: {}", userId);
            
            // Generate and send OTP
            String otpCode = generateOTP();
            logger.info("Generated OTP for {}: {}", email, otpCode);
            long expiresAt = System.currentTimeMillis() + (OTP_EXPIRY_MINUTES * 60 * 1000);
            
            OTP otp = new OTP(email, "REGISTRATION", otpCode, expiresAt);
            otpRepository.save(otp);
            logger.info("OTP saved to database for: {}", email);
            
            emailService.sendOTPEmail(email, otpCode, "Registration");
            logger.info("OTP email sent (or logged) for: {}", email);
            
            // Only return OTP if neither Gmail nor SES is enabled (development mode)
            if (!gmailEnabled && !sesEnabled) {
                logger.info("Neither Gmail nor SES enabled - returning OTP in response: {}", otpCode);
                return new RegisterResponse("OTP sent. Check your email or backend logs.", otpCode);
            }
            
            logger.info("Email service enabled - OTP sent via email");
            return new RegisterResponse("OTP sent to your email.", null);
        } catch (Exception e) {
            logger.error("Error in register() for email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }
    
    public AuthResponse verifyOTP(String email, String otpCode) {
        OTP otp = otpRepository.findByEmailAndType(email, "REGISTRATION");
        
        if (otp == null) {
            throw new RuntimeException("No verification code found. Please register again.");
        }
        
        if (otp.isExpired()) {
            otpRepository.delete(email, "REGISTRATION");
            throw new RuntimeException("Verification code has expired. Please request a new one.");
        }
        
        otp.incrementAttempts();
        if (otp.getAttempts() > MAX_OTP_ATTEMPTS) {
            otpRepository.delete(email, "REGISTRATION");
            throw new RuntimeException("Too many failed attempts. Please request a new verification code.");
        }
        otpRepository.save(otp);
        
        if (!otp.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Invalid verification code. Please try again.");
        }
        
        // OTP verified - delete it and generate tokens
        otpRepository.delete(email, "REGISTRATION");
        
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getUserId());
        
        return new AuthResponse(accessToken, refreshToken, user.getUserId(), user.getEmail());
    }
    
    public RegisterResponse resendOTP(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        // Delete old OTP if exists
        OTP oldOtp = otpRepository.findByEmailAndType(email, "REGISTRATION");
        if (oldOtp != null) {
            otpRepository.delete(email, "REGISTRATION");
        }
        
        // Generate new OTP
        String otpCode = generateOTP();
        long expiresAt = System.currentTimeMillis() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        
        OTP otp = new OTP(email, "REGISTRATION", otpCode, expiresAt);
        otpRepository.save(otp);
        
        emailService.sendOTPEmail(email, otpCode, "Registration");
        
        // Only return OTP if neither Gmail nor SES is enabled (development mode)
        if (!gmailEnabled && !sesEnabled) {
            return new RegisterResponse("OTP resent. Check your email or backend logs.", otpCode);
        }
        
        return new RegisterResponse("OTP resent to your email.", null);
    }
    
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            // Don't reveal if user exists or not for security
            // Just log and return success
            return;
        }
        
        // Generate OTP for password reset
        String otpCode = generateOTP();
        long expiresAt = System.currentTimeMillis() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        
        // Delete old password reset OTP if exists
        OTP oldOtp = otpRepository.findByEmailAndType(email, "PASSWORD_RESET");
        if (oldOtp != null) {
            otpRepository.delete(email, "PASSWORD_RESET");
        }
        
        OTP otp = new OTP(email, "PASSWORD_RESET", otpCode, expiresAt);
        otpRepository.save(otp);
        
        emailService.sendPasswordResetEmail(email, otpCode);
    }
    
    public void resetPassword(String email, String otpCode, String newPassword) {
        logger.info("Password reset request for email: {}", email);
        
        // Verify OTP
        OTP otp = otpRepository.findByEmailAndType(email, "PASSWORD_RESET");
        if (otp == null) {
            throw new RuntimeException("Invalid or expired reset code. Please request a new one.");
        }
        
        // Check if OTP is expired
        if (System.currentTimeMillis() > otp.getExpiresAt()) {
            otpRepository.delete(email, "PASSWORD_RESET");
            throw new RuntimeException("Reset code has expired. Please request a new one.");
        }
        
        // Verify OTP code
        if (!otp.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Invalid reset code. Please check and try again.");
        }
        
        // Find user
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found.");
        }
        
        // Update password
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setHashedPassword(hashedPassword);
        userRepository.save(user);
        
        // Delete used OTP
        otpRepository.delete(email, "PASSWORD_RESET");
        
        logger.info("Password reset successful for email: {}", email);
    }
    
    private String generateOTP() {
        StringBuilder otp = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
    
    public AuthResponse login(String email, String password) {
        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("No account found with this email. Please sign up first.");
            }
            if (!passwordEncoder.matches(password, user.getHashedPassword())) {
                throw new RuntimeException("Invalid password. Please try again.");
            }
            
            // Generate JWT tokens
            String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getEmail());
            String refreshToken = jwtService.generateRefreshToken(user.getUserId());
            
            return new AuthResponse(accessToken, refreshToken, user.getUserId(), user.getEmail());
        } catch (RuntimeException e) {
            // Re-throw RuntimeException as-is (will be handled by GlobalExceptionHandler)
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions (like DynamoDB exceptions) in RuntimeException
            throw new RuntimeException("Authentication failed: " + e.getMessage(), e);
        }
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        try {
            String userId = jwtService.extractUserId(refreshToken);
            
            if (!jwtService.validateToken(refreshToken, userId)) {
                throw new RuntimeException("Invalid refresh token");
            }
            
            User user = userRepository.findById(userId);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            // Generate new tokens
            String newAccessToken = jwtService.generateAccessToken(userId, user.getEmail());
            String newRefreshToken = jwtService.generateRefreshToken(userId);
            
            return new AuthResponse(newAccessToken, newRefreshToken, userId, user.getEmail());
        } catch (Exception e) {
            throw new RuntimeException("Token refresh failed: " + e.getMessage(), e);
        }
    }
    
    public void deleteAccount(String userId) {
        logger.info("Starting account deletion for userId: {}", userId);
        
        try {
            User user = userRepository.findById(userId);
            if (user == null) {
                logger.warn("User not found for deletion: {}", userId);
                throw new RuntimeException("User not found");
            }
            
            String email = user.getEmail();
            logger.info("Deleting all data for user: {} ({})", email, userId);
            
            // Delete all user data
            try {
                pantryRepository.deleteAllByUserId(userId);
                logger.info("Deleted pantry items for user: {}", userId);
            } catch (Exception e) {
                logger.warn("Error deleting pantry items: {}", e.getMessage());
            }
            
            try {
                receiptRepository.deleteAllByUserId(userId);
                logger.info("Deleted receipts for user: {}", userId);
            } catch (Exception e) {
                logger.warn("Error deleting receipts: {}", e.getMessage());
            }
            
            try {
                mealFavoriteRepository.deleteAllByUserId(userId);
                logger.info("Deleted favorites for user: {}", userId);
            } catch (Exception e) {
                logger.warn("Error deleting favorites: {}", e.getMessage());
            }
            
            try {
                shoppingListRepository.deleteAllByUserId(userId);
                logger.info("Deleted shopping lists for user: {}", userId);
            } catch (Exception e) {
                logger.warn("Error deleting shopping lists: {}", e.getMessage());
            }
            
            try {
                otpRepository.deleteAllByEmail(email);
                logger.info("Deleted OTPs for email: {}", email);
            } catch (Exception e) {
                logger.warn("Error deleting OTPs: {}", e.getMessage());
            }
            
            // Finally, delete the user account
            userRepository.delete(userId);
            logger.info("Successfully deleted user account: {} ({})", email, userId);
            
        } catch (Exception e) {
            logger.error("Error deleting account for userId {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete account: " + e.getMessage(), e);
        }
    }
}
