# SmartCart Clean URL Setup Guide

## 🎯 Goal: Get a clean URL like `smartcart.vercel.app` (no "ngrok")

## ✅ Option 1: Deploy to Vercel (Recommended - Easiest)

### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

4. **Result**: You'll get `https://smartcart-xxxxx.vercel.app` or similar

5. **Custom Domain** (optional): You can add your own domain later in Vercel dashboard

### Pros:
- ✅ Clean URL (no "ngrok")
- ✅ Free forever
- ✅ Permanent URL
- ✅ Easy to update (just run `vercel --prod` again)
- ✅ Can add custom domain later

---

## Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod
   ```

4. **Result**: `https://smartcart-xxxxx.netlify.app`

---

## Option 3: Cloudflare Pages

1. Go to: https://pages.cloudflare.com
2. Connect your GitHub repo (or upload manually)
3. Build command: `cd frontend && npm run build`
4. Output directory: `frontend/dist`
5. **Result**: `https://smartcart.pages.dev`

---

## ⚠️ Important: Backend Configuration

Since your backend runs on `localhost:8080`, you'll need to:

1. **Option A**: Deploy backend too (to AWS, Railway, Render, etc.)
2. **Option B**: Keep backend on localhost and use a tunnel just for backend
3. **Option C**: Use environment variables to point frontend to deployed backend

For now, if you want to share the app:
- Frontend: Deploy to Vercel → `smartcart.vercel.app`
- Backend: Keep tunnel running → `https://backend-tunnel.trycloudflare.com`
- Update frontend API URL to point to backend tunnel

---

## Quick Start (Vercel):

Run:
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

Or manually:
```bash
cd frontend
npm run build
vercel --prod
```

Let me know which option you prefer!







