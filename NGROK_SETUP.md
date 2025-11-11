# ngrok Setup Required

## ⚠️ ngrok Requires Authentication

ngrok now requires a free account. Here's how to set it up:

### Step 1: Sign Up (Free)
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with email (free account)
3. Verify your email

### Step 2: Get Your Auth Token
1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6rst7uvw8xyz9`)

### Step 3: Configure ngrok
Run this command (replace with your actual token):
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 4: Then Run Share Script
```bash
./share.sh
```

## Alternative: Use Cloudflare Tunnel (No Signup!)

If you don't want to sign up for ngrok, use Cloudflare Tunnel instead:

```bash
# Install
brew install cloudflared

# Tunnel backend
cloudflared tunnel --url http://localhost:8080

# In another terminal, tunnel frontend
cloudflared tunnel --url http://localhost:5173
```

## Quick Setup Script

Once you have your ngrok authtoken, I can create a script that does everything automatically!







