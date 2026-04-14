# AWS SES Email Setup Guide

This guide will help you configure AWS SES to send OTP emails to Gmail.

## Prerequisites
- AWS Account (free tier is fine)
- Gmail account

## Step 1: Set Up AWS SES

### 1.1 Verify Your Email Address in AWS SES

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Make sure you're in the **us-east-1** region (or your preferred region)
3. Click **Verified identities** → **Create identity**
4. Select **Email address**
5. Enter your Gmail address (e.g., `yourname@gmail.com`)
6. Click **Create identity**
7. Check your Gmail inbox for a verification email from AWS
8. Click the verification link in the email

### 1.2 Verify Your Sender Email (Optional but Recommended)

1. In AWS SES Console, create another verified identity
2. Use a professional sender email like `noreply@yourdomain.com` or verify your Gmail as sender
3. For testing, you can use your Gmail address as both sender and recipient

### 1.3 Request Production Access (Important!)

**By default, AWS SES is in "Sandbox" mode**, which only allows sending to verified email addresses.

**To send to any Gmail address:**
1. In AWS SES Console, go to **Account dashboard**
2. Click **Request production access**
3. Fill out the form explaining your use case (e.g., "Sending OTP verification codes for user registration")
4. Wait for approval (usually 24-48 hours)

**For testing now (Sandbox mode):**
- You can only send emails to verified addresses
- Verify your Gmail address first, then you can send OTPs to it

## Step 2: Create AWS IAM User with SES Permissions

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Enter username: `smartcart-ses-user`
4. Click **Next**
5. Click **Attach policies directly**
6. Search for and select: **AmazonSESFullAccess** (or create a custom policy with just `ses:SendEmail` permission)
7. Click **Next** → **Create user**
8. Click on the user → **Security credentials** tab
9. Click **Create access key**
10. Select **Application running outside AWS**
11. Click **Next** → **Create access key**
12. **IMPORTANT**: Copy both:
    - **Access key ID**
    - **Secret access key** (only shown once!)

## Step 3: Configure Your Backend

### Option A: Using Environment Variables (Recommended)

Create a `.env` file in the `backend` directory or set environment variables:

```bash
# AWS Configuration
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_access_key_id_here
export AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# SES Configuration
export AWS_SES_ENABLED=true
export AWS_SES_FROM_EMAIL=yourname@gmail.com  # Use your verified email
```

### Option B: Update application.yml

Edit `backend/src/main/resources/application.yml`:

```yaml
aws:
  region: us-east-1
  ses:
    enabled: true
    from-email: yourname@gmail.com  # Your verified Gmail address
```

**Note**: Don't commit AWS credentials to git! Use environment variables.

## Step 4: Restart Your Backend

```bash
cd backend
mvn spring-boot:run
```

## Step 5: Test Registration

1. Go to your registration page
2. Enter your Gmail address
3. Click "Sign Up"
4. Check your Gmail inbox (and spam folder) for the OTP email

## Troubleshooting

### Emails Not Arriving?

1. **Check AWS SES Console**:
   - Go to **Sending statistics** → Check for bounces/complaints
   - Go to **Verified identities** → Ensure your email is verified

2. **Check Backend Logs**:
   - Look for errors like "Access Denied" or "Invalid credentials"
   - Check if SES is enabled: `SES Enabled: true`

3. **Check Gmail**:
   - Check spam/junk folder
   - Check "All Mail" folder
   - Search for "SmartCart" or "verification code"

4. **Sandbox Mode Limitations**:
   - If you're in sandbox mode, you can only send to verified addresses
   - Verify the recipient email in AWS SES Console

### Common Errors

- **"Email address not verified"**: Verify your sender email in AWS SES
- **"Access Denied"**: Check IAM user permissions
- **"Invalid credentials"**: Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- **"Region mismatch"**: Ensure AWS_REGION matches your SES region

## Security Best Practices

1. **Never commit AWS credentials to git**
2. **Use IAM roles** in production (instead of access keys)
3. **Rotate access keys** regularly
4. **Use least privilege** - only grant SES permissions needed
5. **Enable MFA** on your AWS account

## Cost

- **AWS SES Free Tier**: 62,000 emails/month free (if sent from EC2)
- **After free tier**: $0.10 per 1,000 emails
- **Very affordable** for OTP emails!

## Need Help?

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS SES Troubleshooting](https://docs.aws.amazon.com/ses/latest/dg/troubleshooting.html)
- Check backend logs for detailed error messages





