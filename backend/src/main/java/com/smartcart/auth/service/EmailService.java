package com.smartcart.auth.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired(required = false)
    private SesClient sesClient;
    
    @Autowired(required = false)
    private JavaMailSender javaMailSender;
    
    @Value("${aws.ses.enabled:false}")
    private boolean sesEnabled;
    
    @Value("${aws.ses.from-email:noreply@smartcart.com}")
    private String sesFromEmail;
    
    @Value("${gmail.enabled:false}")
    private boolean gmailEnabled;
    
    @Value("${gmail.user:}")
    private String gmailUser;
    
    @Value("${spring.mail.username:}")
    private String mailUsername;
    
    @Value("${sendgrid.enabled:false}")
    private boolean sendgridEnabled;
    
    @Value("${sendgrid.api-key:}")
    private String sendgridApiKey;
    
    @Value("${sendgrid.from-email:smartcart2025.app@gmail.com}")
    private String sendgridFromEmail;
    
    private String getFromEmail() {
        if (sendgridEnabled && !sendgridFromEmail.isEmpty()) {
            return sendgridFromEmail;
        }
        if (gmailEnabled && !mailUsername.isEmpty()) {
            return mailUsername;
        }
        return sesFromEmail;
    }
    
    public void sendOTPEmail(String email, String otpCode, String type) {
        String subject = "Your SmartCart Verification Code";
        String bodyText = String.format(
            "Hello,\n\n" +
            "Your verification code for SmartCart is: %s\n\n" +
            "This code will expire in 10 minutes.\n\n" +
            "If you didn't request this code, please ignore this email.\n\n" +
            "Best regards,\n" +
            "SmartCart Team",
            otpCode
        );
        
        String bodyHtml = String.format(
            "<html><body style='font-family: Arial, sans-serif;'>" +
            "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
            "<h2 style='color: #14b8a6;'>SmartCart Verification Code</h2>" +
            "<p>Hello,</p>" +
            "<p>Your verification code is:</p>" +
            "<div style='background-color: #f0f9ff; border: 2px solid #14b8a6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>" +
            "<p style='font-size: 32px; font-weight: bold; color: #14b8a6; margin: 0; letter-spacing: 4px;'>%s</p>" +
            "</div>" +
            "<p>This code will expire in 10 minutes.</p>" +
            "<p>If you didn't request this code, please ignore this email.</p>" +
            "<p>Best regards,<br><strong>SmartCart Team</strong></p>" +
            "</div>" +
            "</body></html>",
            otpCode
        );
        
        sendEmail(email, subject, bodyText, bodyHtml);
        
        // Always log for development/debugging
        logger.info("=== OTP EMAIL ===");
        logger.info("To: {}", email);
        logger.info("Type: {}", type);
        logger.info("OTP Code: {}", otpCode);
        logger.info("SendGrid Enabled: {}", sendgridEnabled);
        logger.info("Gmail Enabled: {}", gmailEnabled);
        logger.info("SES Enabled: {}", sesEnabled);
        logger.info("================");
    }
    
    public void sendPasswordResetEmail(String email, String resetToken) {
        String subject = "Reset Your SmartCart Password";
        
        String bodyText = String.format(
            "Hello,\n\n" +
            "You requested to reset your password for SmartCart.\n\n" +
            "Your password reset code is: %s\n\n" +
            "Enter this code on the reset password page within 10 minutes to create a new password.\n\n" +
            "If you didn't request a password reset, please ignore this email.\n\n" +
            "Best regards,\n" +
            "SmartCart Team",
            resetToken
        );
        
        String bodyHtml = String.format(
            "<html><body style='font-family: Arial, sans-serif;'>" +
            "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
            "<h2 style='color: #14b8a6;'>Reset Your SmartCart Password</h2>" +
            "<p>Hello,</p>" +
            "<p>You requested to reset your password for SmartCart.</p>" +
            "<p>Your password reset code is:</p>" +
            "<div style='background-color: #f0f9ff; border: 2px solid #14b8a6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>" +
            "<p style='font-size: 32px; font-weight: bold; color: #14b8a6; margin: 0; letter-spacing: 4px;'>%s</p>" +
            "</div>" +
            "<p>Enter this code on the SmartCart reset password page within 10 minutes to create a new password.</p>" +
            "<p>If you didn't request a password reset, please ignore this email.</p>" +
            "<p>Best regards,<br><strong>SmartCart Team</strong></p>" +
            "</div>" +
            "</body></html>",
            resetToken
        );
        
        sendEmail(email, subject, bodyText, bodyHtml);
        
        // Always log for development/debugging
        logger.info("=== PASSWORD RESET EMAIL ===");
        logger.info("To: {}", email);
        logger.info("Reset Token: {}", resetToken);
        logger.info("SendGrid Enabled: {}", sendgridEnabled);
        logger.info("Gmail Enabled: {}", gmailEnabled);
        logger.info("SES Enabled: {}", sesEnabled);
        logger.info("============================");
    }
    
    private void sendEmail(String toEmail, String subject, String bodyText, String bodyHtml) {
        logger.info("=== ATTEMPTING TO SEND EMAIL ===");
        logger.info("To: {}", toEmail);
        logger.info("SendGrid Enabled: {}", sendgridEnabled);
        logger.info("Gmail Enabled: {}", gmailEnabled);
        logger.info("JavaMailSender: {}", javaMailSender != null ? "Available" : "NULL");
        logger.info("SES Enabled: {}", sesEnabled);
        logger.info("SES Client: {}", sesClient != null ? "Available" : "NULL");
        
        // Priority 1: Use SendGrid if enabled
        if (sendgridEnabled && sendgridApiKey != null && !sendgridApiKey.trim().isEmpty()) {
            try {
                logger.info("Attempting to send via SendGrid...");
                logger.info("From Email: {}", sendgridFromEmail);
                
                Email from = new Email(sendgridFromEmail, "SmartCart");
                Email to = new Email(toEmail);
                Content textContent = new Content("text/plain", bodyText);
                Content htmlContent = new Content("text/html", bodyHtml);
                Mail mail = new Mail(from, subject, to, textContent);
                mail.addContent(htmlContent);
                
                SendGrid sg = new SendGrid(sendgridApiKey);
                Request request = new Request();
                request.setMethod(Method.POST);
                request.setEndpoint("mail/send");
                request.setBody(mail.build());
                
                Response response = sg.api(request);
                
                if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                    logger.info("✅ Email sent successfully via SendGrid. Status: {}, To: {}", response.getStatusCode(), toEmail);
                    return;
                } else {
                    logger.error("❌ SendGrid returned error status: {} - {}", response.getStatusCode(), response.getBody());
                    logger.error("   Response headers: {}", response.getHeaders());
                    // Fall through to try other methods
                }
            } catch (Exception e) {
                logger.error("❌ Failed to send email via SendGrid: {}", e.getMessage(), e);
                logger.error("   Error type: {}", e.getClass().getSimpleName());
                // Fall through to try other methods
            }
        } else {
            if (!sendgridEnabled) {
                logger.debug("SendGrid is disabled (sendgridEnabled=false)");
            }
            if (sendgridApiKey == null || sendgridApiKey.trim().isEmpty()) {
                logger.debug("SendGrid API key is not configured (SENDGRID_API_KEY env var)");
            }
        }
        
        // Check Spring Mail configuration
        if (javaMailSender == null) {
            logger.error("❌ CRITICAL: JavaMailSender bean is NULL!");
            logger.error("   This means Spring Mail is not configured properly.");
            logger.error("   Check that spring.mail.username and spring.mail.password are set.");
            logger.error("   Current mailUsername: '{}'", mailUsername.isEmpty() ? "EMPTY" : mailUsername);
        }
        
        // Priority 2: Use Gmail SMTP if enabled
        if (gmailEnabled && javaMailSender != null) {
            try {
                logger.info("Attempting to send via Gmail SMTP...");
                logger.info("From Email: {}", getFromEmail());
                logger.info("Gmail User: {}", gmailUser);
                logger.info("Mail Username: {}", mailUsername.isEmpty() ? "EMPTY - CHECK CONFIG!" : mailUsername);
                
                MimeMessage message = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                String fromEmail = getFromEmail();
                logger.info("Using From Email: {}", fromEmail);
                
                helper.setFrom(fromEmail, "SmartCart");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(bodyText, bodyHtml);
                
                logger.info("Sending email via JavaMailSender...");
                javaMailSender.send(message);
                logger.info("✅ Email sent successfully via Gmail SMTP. To: {}", toEmail);
                return;
            } catch (MessagingException e) {
                logger.error("❌ Failed to send email via Gmail SMTP (MessagingException): {}", e.getMessage(), e);
                logger.error("   Exception details: {}", e.getClass().getName());
                if (e.getCause() != null) {
                    logger.error("   Cause: {}", e.getCause().getMessage());
                    logger.error("   Cause type: {}", e.getCause().getClass().getName());
                }
                // Log full stack trace for debugging
                logger.error("   Full stack trace:", e);
                // Fall through to try SES or log
            } catch (Exception e) {
                logger.error("❌ Unexpected error sending email via Gmail: {}", e.getMessage(), e);
                logger.error("   Exception type: {}", e.getClass().getName());
                logger.error("   Full stack trace:", e);
                // Fall through to try SES or log
            }
        } else {
            if (!gmailEnabled) {
                logger.warn("⚠️  Gmail is disabled (gmailEnabled=false)");
                logger.warn("   Check GMAIL_ENABLED environment variable");
            }
            if (javaMailSender == null) {
                logger.error("⚠️  JavaMailSender bean is NULL - Spring Mail might not be configured");
                logger.error("   Spring Boot auto-configuration requires:");
                logger.error("   - spring.mail.host (should be smtp.gmail.com)");
                logger.error("   - spring.mail.port (should be 587)");
                logger.error("   - spring.mail.username (from GMAIL_USER env var)");
                logger.error("   - spring.mail.password (from GMAIL_APP_PASS env var)");
            }
        }
        
        // Priority 3: Use AWS SES if enabled
        if (sesEnabled && sesClient != null) {
            try {
                SendEmailRequest emailRequest = SendEmailRequest.builder()
                    .destination(Destination.builder()
                        .toAddresses(toEmail)
                        .build())
                    .message(Message.builder()
                        .subject(Content.builder()
                            .data(subject)
                            .charset("UTF-8")
                            .build())
                        .body(Body.builder()
                            .text(Content.builder()
                                .data(bodyText)
                                .charset("UTF-8")
                                .build())
                            .html(Content.builder()
                                .data(bodyHtml)
                                .charset("UTF-8")
                                .build())
                            .build())
                        .build())
                    .source(sesFromEmail)
                    .build();
                
                SendEmailResponse response = sesClient.sendEmail(emailRequest);
                logger.info("✅ Email sent successfully via SES. MessageId: {}, To: {}", response.messageId(), toEmail);
                return;
            } catch (software.amazon.awssdk.services.ses.model.MessageRejectedException e) {
                logger.warn("⚠️  Email rejected by SES (likely unverified email in sandbox mode): {}", e.getMessage());
                logger.warn("   To: {}. This is normal in sandbox mode. Request production access to send to any email.", toEmail);
            } catch (software.amazon.awssdk.services.ses.model.AccountSendingPausedException e) {
                logger.error("❌ AWS SES account sending is paused. Check AWS SES Console.");
            } catch (software.amazon.awssdk.services.ses.model.MailFromDomainNotVerifiedException e) {
                logger.error("❌ Sender email domain not verified: {}", sesFromEmail);
            } catch (Exception e) {
                logger.error("❌ Failed to send email via SES: {}", e.getMessage(), e);
                logger.error("   Error type: {}", e.getClass().getSimpleName());
            }
        }
        
        // Fallback: Log email details (for development)
        logger.info("⚠️  No email service configured. Email would be sent to: {}", toEmail);
        logger.info("   Subject: {}", subject);
        logger.info("   Body: {}", bodyText);
    }
}
