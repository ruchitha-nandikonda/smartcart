# Setup ngrok for smartcart.ngrok-free.app

## Step 1: Sign Up for ngrok (Free, 2 minutes)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with your email
3. Verify your email

## Step 2: Get Your Auth Token

1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6rst7uvw8xyz9`)

## Step 3: Configure ngrok

Run this command (replace YOUR_TOKEN with your actual token):
```bash
ngrok config add-authtoken YOUR_TOKEN
```

## Step 4: Start SmartCart with Custom URL

Once authenticated, run:
```bash
ngrok http 5173 --domain=smartcart.ngrok-free.app
```

Or use the script:
```bash
./setup-ngrok-smartcart.sh
```

## Result:
You'll get: **https://smartcart.ngrok-free.app** ✅

This URL:
- ✅ Has "smartcart" in it
- ✅ Is permanent (doesn't change)
- ✅ Easy to remember and share
- ✅ Free forever

---

## Quick Setup Script:

After you have your authtoken, I can set it up for you automatically!







