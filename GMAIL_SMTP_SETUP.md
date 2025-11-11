# 🚀 Gmail SMTP Setup Guide for SmartCart

## Why Gmail SMTP?

✅ **Works immediately** - No AWS SES production access needed  
✅ **Send to ANY email** - No verification required  
✅ **Perfect for commercial use** - Works with any user email  
✅ **Free** - Gmail allows sending emails  
✅ **Easy setup** - Just need a Gmail account and app password  

## Step-by-Step Setup

### Step 1: Create Gmail Account for SmartCart

Choose one of these (or create your own):
- `smartcart.app@gmail.com` ✅ Recommended
- `noreply.smartcart@gmail.com`
- `smartcart.verify@gmail.com`

**To create:**
1. Go to: https://accounts.google.com/signup
2. Create account with your chosen name
3. Complete verification

### Step 2: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Find **"2-Step Verification"**
3. Click **"Get started"**
4. Follow the setup process
5. Verify with your phone

### Step 3: Create App Password

1. Go to: https://myaccount.google.com/apppasswords
   (Or: Google Account → Security → 2-Step Verification → App passwords)

2. Select app: **"Mail"**

3. Select device: **"Other (Custom name)"**
   - Enter name: `SmartCartOTP`
   - Click **"Generate"**

4. **COPY the 16-character password** (you'll only see it once!)
   - Format: `xxxx xxxx xxxx xxxx` (remove spaces when using)

### Step 4: Update Your .env File

Edit `backend/.env` and add:

```bash
# Gmail SMTP Configuration
GMAIL_ENABLED=true
GMAIL_USER=smartcart.app@gmail.com
GMAIL_APP_PASS=your_16_character_app_password_here

# Disable AWS SES (optional - Gmail takes priority)
AWS_SES_ENABLED=false
```

**Important:**
- Remove spaces from the app password
- Keep it secure - don't commit to git!

### Step 5: Restart Backend

```bash
cd backend
mvn spring-boot:run
```

### Step 6: Test It!

1. Register with any email address
2. Check inbox for OTP email
3. Email should arrive within seconds!

## Configuration Priority

The system tries in this order:
1. **Gmail SMTP** (if `GMAIL_ENABLED=true`)
2. **AWS SES** (if `AWS_SES_ENABLED=true`)
3. **Log to console** (development fallback)

## Benefits

✅ **No AWS SES production access needed**  
✅ **Send to any email address**  
✅ **Professional sender name** ("SmartCart")  
✅ **Works immediately**  
✅ **Free** (Gmail free tier)  

## Limits

- Gmail free: ~500 emails/day
- For higher volume, consider AWS SES production access later

## Security Notes

- ✅ App password is more secure than regular password
- ✅ Can revoke app password anytime
- ✅ Doesn't affect your main Gmail account security
- ✅ Keep app password secret!

## Troubleshooting

**"Authentication failed" error:**
- Check app password is correct (no spaces)
- Verify 2-Step Verification is enabled
- Make sure you're using app password, not regular password

**Emails not arriving:**
- Check spam folder
- Verify Gmail account is active
- Check backend logs for errors

**"Less secure app" error:**
- Make sure you're using App Password, not regular password
- App passwords bypass "less secure app" restrictions

## Quick Setup Script

Run this to update your .env:

```bash
cd backend
cat >> .env << 'EOF'

# Gmail SMTP Configuration
GMAIL_ENABLED=true
GMAIL_USER=smartcart.app@gmail.com
GMAIL_APP_PASS=your_app_password_here
EOF
```

Then edit `.env` and replace `your_app_password_here` with your actual app password.

---

**Ready to set up?** Follow the steps above! 🚀





