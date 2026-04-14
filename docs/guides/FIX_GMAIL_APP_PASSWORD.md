# 🔧 Fix Gmail App Password

## Current Issue

Your `.env` file has: `GMAIL_APP_PASS=Surenderreddy@1974`

This is **NOT** a Gmail App Password! It's too long (18 characters) and contains `@`.

## Gmail App Password Requirements

- ✅ **Exactly 16 characters**
- ✅ **No spaces** (remove spaces from the generated password)
- ✅ **Created from Google Account settings**
- ✅ **Format**: `xxxxxxxxxxxxxxxx` (16 characters, no spaces)

## Steps to Fix

### 1. Create a New App Password

1. Go to: **https://myaccount.google.com/apppasswords**
   - Or: Google Account → Security → 2-Step Verification → App passwords

2. Select:
   - **App**: Mail
   - **Device**: Other (Custom name)
   - **Name**: `SmartCartOTP`

3. Click **"Generate"**

4. **COPY the 16-character password** (shown only once!)
   - Format: `xxxx xxxx xxxx xxxx`
   - **Remove all spaces** → `xxxxxxxxxxxxxxxx`

### 2. Update backend/.env

Edit `backend/.env` and replace the password:

```bash
GMAIL_ENABLED=true
GMAIL_USER=smartcart2025.app@gmail.com
GMAIL_APP_PASS=your_16_character_app_password_here
```

**Important:**
- Remove ALL spaces from the app password
- It should be exactly 16 characters
- No special characters except letters and numbers

### 3. Restart Backend

After updating `.env`, restart the backend:

```bash
# Stop backend (Ctrl+C)
# Then restart:
cd backend
source ../backend/.env
mvn spring-boot:run
```

### 4. Test

1. Register a new account
2. Check backend logs for: `✅ Email sent successfully via Gmail SMTP`
3. Check your Gmail inbox for the OTP email

## Verify App Password

A valid Gmail App Password:
- ✅ 16 characters long
- ✅ Only letters and numbers (no @, spaces, or special chars)
- ✅ Created from Google Account App Passwords page

Your current password (`Surenderreddy@1974`):
- ❌ 18 characters (too long)
- ❌ Contains `@` (invalid character)

## Still Not Working?

If emails still don't send after fixing the app password:

1. **Check backend logs** for error messages
2. **Verify 2-Step Verification** is enabled
3. **Regenerate App Password** if needed
4. **Check Gmail inbox** (including spam folder)





