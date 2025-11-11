# 📧 Registering with Different Email Addresses

## Current Setup

- **Verified Email**: `nandikondaruchitha@gmail.com`
- **AWS SES Mode**: Sandbox (default for new accounts)

## How It Works

### In Sandbox Mode (Current):

**✅ You CAN send emails to:**
- `nandikondaruchitha@gmail.com` (verified)
- Any other email you verify in AWS SES

**❌ You CANNOT send emails to:**
- Unverified email addresses
- Any random email address

### What Happens When You Register with Different Email:

1. **If the email is verified in AWS SES:**
   - ✅ OTP email will be sent successfully
   - ✅ User receives OTP in their inbox

2. **If the email is NOT verified:**
   - ❌ AWS SES will reject the email
   - ❌ Backend will log an error
   - ❌ User won't receive OTP
   - ⚠️ Registration might fail or show error

## Solutions

### Option 1: Verify Additional Emails (Quick - 2 minutes per email)

**For testing with specific emails:**

1. Go to AWS SES Console: https://console.aws.amazon.com/ses/
2. Click "Verified identities" → "Create identity"
3. Enter the email address you want to use
4. Check that email inbox and click verification link
5. Now you can send OTPs to that email!

**Pros:**
- ✅ Quick and easy
- ✅ Free
- ✅ Good for testing

**Cons:**
- ❌ Need to verify each email individually
- ❌ Not practical for production with many users

### Option 2: Request Production Access (Best for Production)

**To send to ANY email address:**

1. Go to AWS SES Console: https://console.aws.amazon.com/ses/
2. Click "Account dashboard" (left sidebar)
3. Click "Request production access"
4. Fill out the form:
   - **Use case**: "Sending OTP verification codes for user registration"
   - **Website URL**: Your app URL
   - **Describe your use case**: Explain you're sending OTP codes for account verification
5. Submit request
6. Wait for approval (usually 24-48 hours)

**Pros:**
- ✅ Can send to any email address
- ✅ No need to verify each user's email
- ✅ Required for production apps

**Cons:**
- ⏰ Takes 24-48 hours for approval
- 📝 Requires filling out a form

### Option 3: Use Development Mode (Current Setup)

**For now, you can:**

1. **Test with verified email**: Use `nandikondaruchitha@gmail.com`
2. **Verify additional test emails**: Add more emails to AWS SES for testing
3. **Show OTP in UI**: In development, OTP is also shown on the verification page

## Current Behavior

Right now, the backend will:
- ✅ Try to send email via AWS SES
- ✅ If SES fails (unverified email), it will log an error
- ✅ In development mode, OTP is also returned in API response
- ✅ Frontend shows OTP on verification page (development mode)

## Recommendation

**For Development/Testing:**
- Verify a few test email addresses in AWS SES
- Use those for testing registration

**For Production:**
- Request production access from AWS SES
- This allows sending to any email address

## Quick Commands

**Check which emails are verified:**
```bash
# If AWS CLI is installed:
aws ses list-identities --region us-east-1
```

**Verify a new email:**
1. Go to: https://console.aws.amazon.com/ses/
2. Verified identities → Create identity
3. Enter email → Verify

## Need Help?

- Check AWS SES Console for verification status
- See `AWS_SES_SETUP.md` for detailed instructions
- Backend logs will show email sending errors





