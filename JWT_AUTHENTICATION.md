# JWT Authentication System - Implementation Guide

## ✅ Implementation Complete

SmartCart now has a complete JWT-based authentication system!

## 🔐 Backend Implementation

### Components Created

1. **JwtService** (`backend/src/main/java/com/smartcart/auth/service/JwtService.java`)
   - Generates access tokens (1 hour expiration)
   - Generates refresh tokens (7 days expiration)
   - Validates tokens
   - Extracts user info from tokens

2. **JwtAuthenticationFilter** (`backend/src/main/java/com/smartcart/auth/filter/JwtAuthenticationFilter.java`)
   - Intercepts all requests
   - Validates JWT tokens from Authorization header
   - Sets Spring Security context
   - Adds userId and email to request attributes

3. **Updated AuthService** (`backend/src/main/java/com/smartcart/auth/AuthService.java`)
   - Uses JWT tokens instead of simple strings
   - Generates refresh tokens
   - Added `refreshToken()` method

4. **Updated AuthController** (`backend/src/main/java/com/smartcart/auth/AuthController.java`)
   - Added `/api/auth/refresh` endpoint
   - Returns proper JWT tokens

5. **Updated SecurityConfig** (`backend/src/main/java/com/smartcart/common/config/SecurityConfig.java`)
   - Integrated JWT filter
   - Protected endpoints require authentication
   - Public endpoints: `/api/auth/**`, `/api/deals/**`

### Configuration

**application.yml:**
```yaml
jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production-minimum-32-characters-long}
  access-token-expiration: 3600000   # 1 hour
  refresh-token-expiration: 604800000 # 7 days
```

## 🎨 Frontend Implementation

### Components Updated

1. **authApi** (`frontend/src/api/auth.ts`)
   - Updated to handle `accessToken` and `refreshToken`
   - Added `refreshToken()` method

2. **apiClient** (`frontend/src/api/client.ts`)
   - Request interceptor: Adds `Authorization: Bearer <token>` header
   - Response interceptor: Auto-refreshes token on 401 errors
   - Stores tokens in localStorage

3. **authSlice** (`frontend/src/store/authSlice.ts`)
   - Stores `accessToken` and `refreshToken`
   - Backward compatible with legacy `token` field

4. **Login Page** (`frontend/src/pages/Login.tsx`)
   - Updated to handle new auth response format

## 📡 API Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "userId": "uuid",
  "email": "user@example.com"
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response:** Same as register/login (new tokens)

## 🔒 Security Features

- **Password Hashing:** BCrypt encryption
- **Token Signing:** HMAC-SHA512
- **Token Expiration:** 
  - Access tokens: 1 hour
  - Refresh tokens: 7 days
- **Automatic Refresh:** Frontend automatically refreshes expired access tokens
- **Stateless:** No server-side sessions

## 🧪 Testing

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token in requests
curl -H "Authorization: Bearer <accessToken>" \
  http://localhost:8080/api/pantry
```

## 📝 Next Steps

1. ✅ JWT Authentication - COMPLETE
2. ⏭️ Implement protected endpoints (pantry, receipts, etc.)
3. ⏭️ Add user profile management
4. ⏭️ Add password reset functionality
5. ⏭️ Consider httpOnly cookies for production (more secure than localStorage)

## 🔧 Environment Variables

Set in your environment or `.env` file:
```bash
JWT_SECRET=your-256-bit-secret-key-change-in-production-minimum-32-characters-long
JWT_ACCESS_TOKEN_EXPIRATION=3600000  # Optional, defaults to 1 hour
JWT_REFRESH_TOKEN_EXPIRATION=604800000  # Optional, defaults to 7 days
```

**IMPORTANT:** Change `JWT_SECRET` in production to a strong, random 32+ character string!









