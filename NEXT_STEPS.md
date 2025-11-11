# Quick Reference - AWS SES Setup Complete! ✅

## ✅ What's Done:
- Configuration file created: `backend/.env`
- AWS credentials configured
- Ready to send emails!

## 📋 Next Steps:

### Step 1: Verify Your Email in AWS SES (IMPORTANT!)

1. **Open AWS SES Console:**
   👉 https://console.aws.amazon.com/ses/

2. **Select Region:**
   - Make sure you're in **"US East (N. Virginia)"** region (top right)
   - This is the `us-east-1` region

3. **Verify Your Email:**
   - Click **"Verified identities"** in the left sidebar
   - Click the orange **"Create identity"** button
   - Select **"Email address"**
   - Enter: `nandikondaruchitha@gmail.com`
   - Click **"Create identity"**

4. **Check Your Email:**
   - Go to your Gmail inbox
   - Look for an email from AWS SES
   - Click the verification link
   - You should see "Email address verified" message

### Step 2: Load Environment Variables

```bash
source backend/.env
```

This loads your AWS credentials into the current terminal session.

### Step 3: Start Your Backend

```bash
cd backend
mvn spring-boot:run
```

Wait for the backend to start (you'll see "Started SmartCartApplication" message).

### Step 4: Test It!

1. Go to your registration page
2. Enter email: `nandikondaruchitha@gmail.com`
3. Enter a password
4. Click "Sign Up"
5. **Check your Gmail inbox** for the OTP email! 📧

## ⚠️ Important Notes:

- **Sandbox Mode**: You can only send emails to verified addresses
- **Make sure** `nandikondaruchitha@gmail.com` is verified in AWS SES
- **Check spam folder** if email doesn't arrive
- **Don't commit** `backend/.env` to git (already in .gitignore)

## 🆘 Troubleshooting:

**Email not arriving?**
- Check spam/junk folder
- Verify email is verified in AWS SES Console
- Check backend logs for errors
- Make sure `AWS_SES_ENABLED=true` in .env file

**"Access Denied" error?**
- Check IAM user has `AmazonSESFullAccess` policy
- Verify AWS credentials are correct

**"Email not verified" error?**
- Go to AWS SES Console → Verified identities
- Make sure your email shows "Verified" status

## 🎉 You're Almost There!

Once you verify your email in AWS SES, you'll be able to receive OTP emails in your Gmail! 🚀
