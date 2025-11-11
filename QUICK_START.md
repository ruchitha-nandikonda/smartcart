# SmartCart - Quick Start Guide for Gmail OTP Emails

## 🚀 Fastest Way to Get Started

### Option 1: Interactive Setup (Recommended)
```bash
./quick-setup-ses.sh
```
This script will guide you through the setup step by step.

### Option 2: Manual Setup

1. **Verify your email in AWS SES** (5 minutes):
   - Go to: https://console.aws.amazon.com/ses/
   - Click "Verified identities" → "Create identity"
   - Enter your Gmail address
   - Check email and click verification link

2. **Create AWS Access Keys** (5 minutes):
   - Go to: https://console.aws.amazon.com/iam/
   - Create IAM user with `AmazonSESFullAccess` policy
   - Create access key and copy both keys

3. **Set environment variables**:
   ```bash
   export AWS_REGION=us-east-1
   export AWS_ACCESS_KEY_ID=your_key_here
   export AWS_SECRET_ACCESS_KEY=your_secret_here
   export AWS_SES_ENABLED=true
   export AWS_SES_FROM_EMAIL=yourname@gmail.com
   ```

4. **Start backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

5. **Test it**:
   - Register with your Gmail
   - Check inbox for OTP email!

## ✅ Verify Setup

Run the verification script:
```bash
./setup-ses.sh
```

## 📖 Need More Help?

See `AWS_SES_SETUP.md` for detailed instructions.





