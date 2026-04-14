# Troubleshooting Guide

## Current Status Check

### 1. Verify Backend is Running
```bash
curl http://localhost:8080/actuator/health
```
Should return: `{"status":"UP",...}`

### 2. Verify Frontend is Running
```bash
curl http://localhost:5173
```
Should return HTML with SmartCart title

### 3. Check Browser Console (F12)
Look for:
- Network errors (404, 500, CORS)
- JavaScript errors
- API call failures

## Common Issues & Fixes

### Issue: "Failed to load pantry items"
**Cause**: Not logged in or backend not running
**Fix**: 
1. Register/Login first
2. Check backend: `curl http://localhost:8080/actuator/health`

### Issue: "No static resource api/assistant/suggest-meals"
**Cause**: Invalid API path or not authenticated
**Fix**:
- Ensure you're logged in (JWT token in localStorage)
- Check API path is `/assistant/suggest-meals` (not `/api/assistant/...`)

### Issue: Assistant shows no suggestions
**Cause**: Empty pantry or no deals
**Fix**:
- Add items to pantry first
- Ensure deals are imported

## Quick Test Commands

```bash
# Check backend
curl http://localhost:8080/actuator/health

# Check if Assistant endpoint exists (will fail auth, but confirms route)
curl http://localhost:8080/api/assistant/suggest-meals

# Check frontend
curl http://localhost:5173 | grep -o "<title>.*</title>"
```

