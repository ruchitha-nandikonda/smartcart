# SmartCart Custom URL Setup Guide

## 🎯 Goal: Get a Custom URL
**Desired URL**: `https://smartcart.ngrok-free.app`

## 📋 Setup Steps:

### Step 1: Sign Up for ngrok (Free, 30 seconds)
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with your email (free account)
3. Verify your email

### Step 2: Get Your Auth Token
1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6rst7uvw8xyz9`)

### Step 3: Configure ngrok
Run this command (replace with your actual token):
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 4: Start SmartCart with Custom URL
Run:
```bash
./setup-smartcart-url.sh
```

Or manually:
```bash
ngrok http 5173 --domain=smartcart.ngrok-free.app
```

## ✅ Result:
You'll get: **https://smartcart.ngrok-free.app**

This URL will:
- ✅ Be permanent (doesn't change)
- ✅ Be meaningful (smartcart)
- ✅ Easy to remember and share

## 🔄 Alternative: Quick Setup Without Signup

If you want to skip signup, I can help you use Cloudflare with a script that restarts until you get a good random name, but it won't be "smartcart" specifically.

Let me know when you've signed up and I'll complete the setup!







