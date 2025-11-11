# SmartCart Clean URL - No Signup Required

## 🎯 Goal: Clean URL without "ngrok" and without signing up for anything

## Option 1: serveo.net (Recommended) ⭐

**URL**: `https://smartcart.serveo.net`

### Setup:
```bash
./setup-serveo-url.sh
```

Or manually:
```bash
ssh -R smartcart:80:localhost:5173 serveo.net
```

**Pros**:
- ✅ Clean URL: `smartcart.serveo.net`
- ✅ No signup required
- ✅ Custom subdomain (smartcart)
- ✅ Free

**Cons**:
- ⚠️ Requires SSH (usually pre-installed on Mac)
- ⚠️ May need to reconnect if connection drops

---

## Option 2: localhost.run

**URL**: `https://smartcart-xxxxx.localhost.run` (random suffix)

### Setup:
```bash
./setup-clean-url-no-signup.sh
```

Or manually:
```bash
ssh -R 80:localhost:5173 nokey@localhost.run
```

**Pros**:
- ✅ No signup required
- ✅ Clean URL (no "ngrok")
- ✅ Free

**Cons**:
- ⚠️ Random suffix in URL
- ⚠️ Requires SSH

---

## Option 3: Keep Cloudflare Tunnel

**URL**: `https://random-name.trycloudflare.com`

**Pros**:
- ✅ Already working
- ✅ No signup required
- ✅ Reliable

**Cons**:
- ⚠️ Random names (not "smartcart")

---

## Quick Start:

1. **For serveo.net** (cleanest):
   ```bash
   ./setup-serveo-url.sh
   ```
   Result: `https://smartcart.serveo.net`

2. **For localhost.run**:
   ```bash
   ./setup-clean-url-no-signup.sh
   ```
   Result: `https://smartcart-xxxxx.localhost.run`

---

## ⚠️ Important: Backend Tunnel

Don't forget to keep your backend tunnel running:
```bash
cloudflared tunnel --url http://localhost:8080
```

Then update frontend API URL to point to backend tunnel URL.

---

## Recommendation:

Use **serveo.net** - it gives you exactly `smartcart.serveo.net` with no signup!







