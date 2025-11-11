# 🔍 How to Debug Login Errors

## Step 1: Check Browser Console

### Opening Developer Tools:
- **Mac**: Press `Cmd + Option + I` (or `Cmd + Option + J` for console only)
- **Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
- **Alternative**: Right-click anywhere → "Inspect" → Click "Console" tab

### What to Look For:
1. **Expand the `🔴 Full API Error Details` log** - Click the arrow to expand
2. Check these fields:
   - `Status: 500` (or other status code)
   - `Response Data (JSON):` - **This is the most important!** It shows what the backend returned
   - `Error Message:` - Shows the error message

3. **Expand the `🔴 Login Error Details` log** - Click the arrow to expand
   - `Error Message:` - What's being displayed to the user
   - `Error Response Data (JSON):` - The actual backend response

### Example of Good Output:
```
🔴 Full API Error Details
  Status: 401
  Response Data (JSON): {
    "message": "Incorrect password. Please check your password and try again.",
    "errorCode": "AUTH_ERROR",
    "timestamp": "2025-11-04T13:45:00",
    "path": "/api/auth/login"
  }
```

### Example of Bad Output (Current Issue):
```
🔴 Full API Error Details
  Status: 500
  Response Data (JSON): ""
  (Empty response - means backend crashed before returning error)
```

---

## Step 2: Check Backend Terminal

### Where to Look:
1. Find the terminal window where you ran `./START_BACKEND.sh`
2. Scroll up to see the most recent logs (logs appear at the bottom)

### What to Look For:

#### When Login Request Comes In:
```
INFO  ... Login request for email: your-email@example.com
```

#### If Error Occurs:
```
ERROR ... Error in login endpoint: Invalid password. Please try again.
ERROR ... Runtime error: Invalid password. Please try again.
ERROR ... RuntimeException type: java.lang.RuntimeException
```

#### Stack Traces (Lines starting with "at"):
```
at com.smartcart.auth.AuthService.login(AuthService.java:43)
at com.smartcart.auth.AuthController.login(AuthController.java:39)
...
```

### Common Error Messages:

#### DynamoDB Connection Issues:
```
ERROR ... The security token included in the request is invalid
ERROR ... Cannot do operations on a non-existent table
```

#### Table Not Found:
```
ERROR ... ResourceNotFoundException: Requested resource not found
ERROR ... Cannot do operations on a non-existent table: Users
```

---

## Step 3: Test the Error Handling

### Quick Test:
1. **Start Backend** (if not running):
   ```bash
   cd /Users/ruchithanandikonda/Desktop/Project/smartcart
   ./START_BACKEND.sh
   ```
   Wait for: `Started SmartCartApplication`

2. **Open Frontend**:
   - Browser: http://localhost:5173
   - Open Console (F12 or Cmd+Option+I)

3. **Try Login with Wrong Password**:
   - Email: your-email@example.com
   - Password: wrongpassword123
   - Click "Sign In"

4. **Check Both Places**:
   - Browser Console → Look for error logs
   - Backend Terminal → Look for error messages

---

## Step 4: What to Share

When reporting issues, please share:

1. **Browser Console Output**:
   - Copy the `Response Data (JSON):` value
   - Copy the `Error Message:` value

2. **Backend Terminal Output**:
   - Copy any ERROR lines
   - Copy any stack traces (lines starting with "at")

3. **What You Expected**:
   - What error message should appear?
   - Example: "Incorrect password. Please check your password and try again."

---

## Visual Guide

### Browser Console Should Look Like:
```
Console Tab:
  ▼ 🔴 Full API Error Details
      Has Response: true
      Status: 500
      Status Text: Internal Server Error
      Response Data: {...}
      ▼ Response Data (JSON): "
          <-- Check this value!
      Error Message: Request failed with status code 500
```

### Backend Terminal Should Look Like:
```
2025-11-04 13:45:00.123  INFO  ... Login request for email: test@example.com
2025-11-04 13:45:00.456  ERROR ... Error in login endpoint: Invalid password...
2025-11-04 13:45:00.789  ERROR ... Runtime error: Invalid password...
```

---

## Troubleshooting

### If Browser Console Shows Empty Response:
- Backend is crashing before it can return error
- Check backend terminal for the actual exception
- Restart backend after fixing compilation errors

### If Backend Shows No Logs:
- Backend might not be running
- Check: `lsof -ti:8080` (should show a process)
- Restart backend: `./START_BACKEND.sh`

### If Error Message is Generic:
- Check if `Response Data (JSON):` has actual data
- If empty, backend exception handler isn't working
- Check backend logs for exception type

