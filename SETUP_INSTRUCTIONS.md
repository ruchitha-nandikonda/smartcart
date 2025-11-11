# 🚀 SmartCart Gmail OTP Setup - Step by Step

I've created setup scripts to help you configure AWS SES. Here's what I've prepared:

## 📁 Files Created

1. **`quick-setup-ses.sh`** - Interactive setup script (easiest!)
2. **`setup-ses.sh`** - Verification script (checks your config)
3. **`AWS_SES_SETUP.md`** - Detailed guide
4. **`QUICK_START.md`** - Quick reference

## 🎯 Easiest Way: Run the Interactive Script

```bash
cd /Users/ruchithanandikonda/Desktop/Project/smartcart
./quick-setup-ses.sh
```

This script will:
- Ask you for your Gmail address
- Ask for AWS credentials
- Create a `.env` file automatically
- Give you next steps

## 📋 Manual Setup (If you prefer)

### Step 1: Verify Your Email in AWS SES (5 min)

1. Open: https://console.aws.amazon.com/ses/
2. Make sure you're in **us-east-1** region (top right)
3. Click **"Verified identities"** → **"Create identity"**
4. Select **"Email address"**
5. Enter your Gmail: `yourname@gmail.com`
6. Click **"Create identity"**
7. **Check your Gmail inbox** for verification email
8. **Click the verification link**

### Step 2: Create AWS Access Keys (5 min)

1. Open: https://console.aws.amazon.com/iam/
2. Click **"Users"** → **"Create user"**
3. Username: `smartcart-ses-user`
4. Click **"Next"**
5. Click **"Attach policies directly"**
6. Search for: `AmazonSESFullAccess`
7. Select it → Click **"Next"** → **"Create user"**
8. Click on the user → **"Security credentials"** tab
9. Click **"Create access key"**
10. Select **"Application running outside AWS"**
11. Click **"Next"** → **"Create access key"**
12. **COPY BOTH:**
    - Access key ID
    - Secret access key (only shown once!)

### Step 3: Configure Your Backend

**Option A: Using Environment Variables (Recommended)**

Open your terminal and run:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=paste_your_access_key_id_here
export AWS_SECRET_ACCESS_KEY=paste_your_secret_access_key_here
export AWS_SES_ENABLED=true
export AWS_SES_FROM_EMAIL=yourname@gmail.com
```

**Option B: Create .env file**

Create `backend/.env` file:

```bash
cd backend
cat > .env << 'EOF'
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_SES_ENABLED=true
AWS_SES_FROM_EMAIL=yourname@gmail.com
EOF
```

Then load it:
```bash
source .env
```

### Step 4: Start Your Backend

```bash
cd backend
mvn spring-boot:run
```

### Step 5: Test It!

1. Go to your registration page
2. Enter your Gmail address
3. Click "Sign Up"
4. **Check your Gmail inbox** (and spam folder) for the OTP!

## ✅ Verify Your Setup

Run the verification script:
```bash
./setup-ses.sh
```

## ⚠️ Important Notes

1. **Sandbox Mode**: By default, AWS SES only sends to verified emails. Make sure you verify your Gmail first!

2. **Production Access**: To send to ANY email address, request production access in AWS SES Console (takes 24-48 hours)

3. **Security**: Never commit `.env` file or AWS credentials to git!

4. **Cost**: First 62,000 emails/month are FREE, then $0.10 per 1,000 emails

## 🆘 Troubleshooting

**Emails not arriving?**
- Check spam folder
- Verify email is verified in AWS SES Console
- Check backend logs for errors
- Make sure `AWS_SES_ENABLED=true`

**"Access Denied" error?**
- Check IAM user has `AmazonSESFullAccess` policy
- Verify AWS credentials are correct

**"Email not verified" error?**
- Go to AWS SES Console → Verified identities
- Verify your sender email address

## 📞 Need Help?

Check `AWS_SES_SETUP.md` for detailed troubleshooting guide.

---

**Ready to start?** Run `./quick-setup-ses.sh` for the easiest setup! 🚀





