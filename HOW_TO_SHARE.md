# How to Share SmartCart with Others

## Option 1: Quick Sharing (Tunneling Service) ⚡

### Using ngrok (Recommended)
1. **Install ngrok**: Download from https://ngrok.com/download
2. **Start your services** (frontend + backend)
3. **Create tunnel for frontend**:
   ```bash
   ngrok http 5173
   ```
4. **Share the ngrok URL** (e.g., `https://abc123.ngrok.io`)
5. **Update backend proxy** (if needed):
   - The frontend proxy should handle `/api` requests
   - Or create a separate tunnel for backend on port 8080

### Using Cloudflare Tunnel (Free)
```bash
# Install cloudflared
brew install cloudflared  # Mac
# or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Create tunnel
cloudflared tunnel --url http://localhost:5173
```

### Using localtunnel (Free, No Signup)
```bash
# Install
npm install -g localtunnel

# Create tunnel
lt --port 5173
```

## Option 2: Deploy to Production 🚀

### Frontend Deployment (Vercel/Netlify)
1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Deploy to Vercel**:
   - Push code to GitHub
   - Connect repo to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com`

3. **Deploy to Netlify**:
   - Similar process, drag & drop `frontend/dist` folder

### Backend Deployment (AWS ECS)
- Use the Terraform configs in `/infra` folder
- Follow `DOCKER_SETUP.md` for container setup
- Deploy to AWS ECS Fargate

## Option 3: Docker Compose + Tunneling 🐳

1. **Start with Docker**:
   ```bash
   docker compose up
   ```

2. **Tunnel the frontend port**:
   ```bash
   ngrok http 5173
   ```

## Current Local URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **DynamoDB Local**: http://localhost:8000

## Important Notes

⚠️ **For local sharing**:
- Backend must be accessible (use tunneling for port 8080 too)
- DynamoDB Local data is temporary (in-memory)
- Each user needs their own account (register/login)

⚠️ **For production**:
- Set up proper AWS DynamoDB (not local)
- Configure CORS properly
- Use HTTPS
- Set secure JWT secrets
- Configure S3 bucket for receipts

## Quick Share Script

Create a file `share.sh`:
```bash
#!/bin/bash
echo "Starting SmartCart sharing..."
echo "1. Make sure frontend and backend are running"
echo "2. Starting ngrok tunnel..."
ngrok http 5173
```

Then share the ngrok URL!







