# SmartCart - Easy Sharing Guide

## ✅ Your Services Status:
- ✅ Backend: Running on port 8080
- ✅ Frontend: Running on port 5173

## 🚀 Quick Share (Easiest Method):

### Option 1: Simple Frontend Tunnel (For Quick Demo)
```bash
ngrok http 5173
```
**Note**: API calls might not work for remote users unless you also tunnel the backend.

### Option 2: Full Setup (Recommended)

**Terminal 1 - Tunnel Backend:**
```bash
ngrok http 8080
```
Copy the URL (e.g., `https://abc123.ngrok.io`)

**Terminal 2 - Update Frontend & Tunnel:**
```bash
export VITE_API_URL=https://abc123.ngrok.io
cd frontend
npm run dev
```

**Terminal 3 - Tunnel Frontend:**
```bash
ngrok http 5173
```
Copy this URL and share it! 🎉

## 📋 Step-by-Step:

1. **Start Backend Tunnel:**
   ```bash
   ngrok http 8080
   ```
   - Copy the `Forwarding` URL (e.g., `https://xyz789.ngrok.io`)

2. **Update Frontend Config:**
   ```bash
   export VITE_API_URL=https://xyz789.ngrok.io
   cd frontend
   npm run dev
   ```

3. **Start Frontend Tunnel:**
   ```bash
   ngrok http 5173
   ```
   - Copy this URL and share it!

4. **Share the Frontend URL** with others!

## 🧪 Test It:

1. Open the frontend ngrok URL in your browser
2. Try registering a new account
3. Try logging in
4. Test the SmartCart Assistant

## 📱 What Others Will See:

- Full SmartCart app
- Can register/login
- Can use all features
- Data is stored in your local DynamoDB (shared)

## ⚠️ Important Notes:

- **Keep both terminals open** (backend + frontend tunnels)
- **Data is shared** - everyone uses the same database
- **URLs change** each time you restart ngrok (unless you use paid plan)
- **For production**, deploy to AWS/Vercel instead

## 🛑 To Stop Sharing:

Press `Ctrl+C` in both ngrok terminals.
