package com.smartcart.auth;

import com.smartcart.auth.dto.AuthResponse;
import com.smartcart.auth.model.User;
import com.smartcart.auth.repository.OTPRepository;
import com.smartcart.auth.repository.UserRepository;
import com.smartcart.auth.service.JwtService;
import com.smartcart.favorites.repository.MealFavoriteRepository;
import com.smartcart.pantry.repository.PantryRepository;
import com.smartcart.receipts.repository.ReceiptRepository;
import com.smartcart.shoppinglist.repository.ShoppingListRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final OTPRepository otpRepository;
    private final JwtService jwtService;
    private final PantryRepository pantryRepository;
    private final ReceiptRepository receiptRepository;
    private final MealFavoriteRepository mealFavoriteRepository;
    private final ShoppingListRepository shoppingListRepository;
    
    public AuthService(PasswordEncoder passwordEncoder, UserRepository userRepository,
                      OTPRepository otpRepository, JwtService jwtService,
                      PantryRepository pantryRepository, ReceiptRepository receiptRepository,
                      MealFavoriteRepository mealFavoriteRepository, ShoppingListRepository shoppingListRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.jwtService = jwtService;
        this.pantryRepository = pantryRepository;
        this.receiptRepository = receiptRepository;
        this.mealFavoriteRepository = mealFavoriteRepository;
        this.shoppingListRepository = shoppingListRepository;
    }
    
    public AuthResponse register(String username, String password) {
        logger.info("Starting registration for username: {}", username);
        try {
            if (userRepository.existsByUsername(username)) {
                logger.warn("Registration failed: User already exists - {}", username);
                throw new RuntimeException("User already exists");
            }
            
            String userId = UUID.randomUUID().toString();
            String hashedPassword = passwordEncoder.encode(password);
            
            User user = new User(userId, username, hashedPassword);
            userRepository.save(user);
            logger.info("User account created successfully: {}", userId);
            
            String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getUsername());
            String refreshToken = jwtService.generateRefreshToken(user.getUserId());
            
            return new AuthResponse(accessToken, refreshToken, user.getUserId(), user.getUsername());
        } catch (Exception e) {
            logger.error("Error in register() for username {}: {}", username, e.getMessage(), e);
            throw e;
        }
    }
    
    public void resetPassword(String username, String newPassword) {
        logger.info("Password reset request for username: {}", username);
        
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("No account found with this username.");
        }
        
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setHashedPassword(hashedPassword);
        userRepository.save(user);
        
        try {
            otpRepository.deleteAllByEmail(username);
        } catch (Exception e) {
            logger.debug("No OTP rows to clear for {}: {}", username, e.getMessage());
        }
        
        logger.info("Password reset successful for username: {}", username);
    }
    
    public AuthResponse login(String username, String password) {
        try {
            User user = userRepository.findByUsername(username);
            if (user == null) {
                throw new RuntimeException("No account found with this username. Please sign up first.");
            }
            if (!passwordEncoder.matches(password, user.getHashedPassword())) {
                throw new RuntimeException("Invalid password. Please try again.");
            }
            
            String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getUsername());
            String refreshToken = jwtService.generateRefreshToken(user.getUserId());
            
            return new AuthResponse(accessToken, refreshToken, user.getUserId(), user.getUsername());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
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
            
            String newAccessToken = jwtService.generateAccessToken(userId, user.getUsername());
            String newRefreshToken = jwtService.generateRefreshToken(userId);
            
            return new AuthResponse(newAccessToken, newRefreshToken, userId, user.getUsername());
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
            
            String username = user.getUsername();
            logger.info("Deleting all data for user: {} ({})", username, userId);
            
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
                otpRepository.deleteAllByEmail(username);
                logger.info("Deleted OTPs for login: {}", username);
            } catch (Exception e) {
                logger.warn("Error deleting OTPs: {}", e.getMessage());
            }
            
            userRepository.delete(userId);
            logger.info("Successfully deleted user account: {} ({})", username, userId);
            
        } catch (Exception e) {
            logger.error("Error deleting account for userId {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete account: " + e.getMessage(), e);
        }
    }
}
