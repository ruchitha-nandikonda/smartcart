# 🔍 Gmail OTP Troubleshooting Guide

## Quick Checks

### 1. Check Backend Logs
Look for these messages when you register:
- ✅ `✅ Email sent successfully via Gmail SMTP. To: your@email.com`
- ❌ `❌ Failed to send email via Gmail SMTP: [error message]`
- ⚠️ `⚠️ No email service configured`

### 2. Verify Gmail Configuration
Check `backend/.env` file:
```bash
GMAIL_ENABLED=true
GMAIL_USER=smartcart2025.app@gmail.com
GMAIL_APP_PASS=your_16_character_app_password
```

### 3. Common Issues

#### Issue: "Authentication failed"
**Solution:**
- Verify 2-Step Verification is enabled on Gmail account
- Make sure you're using App Password (not regular password)
- App password should be 16 characters (no spaces)

#### Issue: "Connection timeout"
**Solution:**
- Check internet connection
- Verify Gmail account is active
- Try checking Gmail account from browser

#### Issue: "Invalid credentials"
**Solution:**
- Regenerate App Password
- Make sure no spaces in app password
- Verify Gmail account email is correct

### 4. Test Steps

1. **Register a new account**
2. **Check backend logs immediately** - Look for email sending status
3. **Check Gmail inbox** - Look for email from `smartcart2025.app@gmail.com`
4. **Check spam folder** - Sometimes emails go to spam initially
5. **Wait 1-2 minutes** - Emails can take a moment to arrive

### 5. Verify Gmail Account

1. Go to: https://myaccount.google.com/security
2. Check "2-Step Verification" is ON
3. Go to: https://myaccount.google.com/apppasswords
4. Verify "SmartCartOTP" app password exists
5. Copy the app password (16 characters, no spaces)

### 6. Reconfigure Gmail (if needed)

If emails still don't work:

1. **Delete old app password**
2. **Create new app password:**
   - App: Mail
   - Device: Other (SmartCartOTP)
3. **Update backend/.env:**
   ```bash
   GMAIL_APP_PASS=new_app_password_here
   ```
4. **Restart backend**

### 7. Check Email Service Status

The backend logs will show:
- `Gmail Enabled: true` - Gmail is configured
- `Gmail Enabled: false` - Gmail is NOT configured (check .env)

## Still Not Working?

Check backend logs for specific error messages and share them for further troubleshooting.





