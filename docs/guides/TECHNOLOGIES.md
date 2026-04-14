# SmartCart - How Technologies Are Used

## Frontend Technologies

### React 18 + TypeScript
**How it's used:**
- **Component-based architecture**: Each page (Login, Pantry, Receipts, etc.) is a React component
- **TypeScript**: Provides type safety - all API responses, props, and state are typed
- **Hooks**: Uses `useState` for local state (form inputs, UI state), `useEffect` for side effects (API calls, event listeners)
- **Example**: `Introduction.tsx` uses `useState` for mouse position tracking and `useEffect` for scroll listeners

### Vite
**How it's used:**
- **Development server**: Fast HMR (Hot Module Replacement) - changes reflect instantly
- **Build tool**: Compiles TypeScript and bundles React app for production
- **Proxy configuration**: Routes `/api` requests to backend (`http://localhost:8080`) during development
- **Host configuration**: Allows access from network (for ngrok/Cloudflare tunnels)

### Redux Toolkit
**How it's used:**
- **Global state management**: Stores authentication tokens, user ID, and email
- **Auth slice**: `authSlice.ts` manages login state - when user logs in, tokens are stored in Redux and localStorage
- **Actions**: `setAuth()` saves tokens, `clearAuth()` removes them on logout
- **Usage**: Components use `useSelector` to access auth state, `useDispatch` to update it
- **Example**: `App.tsx` checks `state.auth.token` to protect routes

### React Router
**How it's used:**
- **Client-side routing**: Defines routes like `/pantry`, `/receipts`, `/plan`
- **Protected routes**: `PrivateRoute` component checks for JWT token - redirects to `/login` if missing
- **Navigation**: `useNavigate()` hook programmatically navigates (e.g., after login)
- **Example**: After successful login, navigates to `/onboarding` or `/pantry`

### Tailwind CSS
**How it's used:**
- **Utility-first styling**: Classes like `bg-gradient-to-r`, `rounded-2xl`, `backdrop-blur-xl`
- **Responsive design**: `md:grid-cols-2` adapts layout for mobile/desktop
- **Custom animations**: Defined in `index.css` (fadeIn, slideDown, ripple effects)
- **Dark theme**: Uses slate/teal/cyan color palette with glassmorphism effects

### Axios
**How it's used:**
- **HTTP client**: `apiClient.ts` creates configured Axios instance with base URL `/api`
- **Interceptors**: 
  - **Request**: Automatically adds `Authorization: Bearer <token>` header to all requests
  - **Response**: Handles 401 errors by refreshing JWT token automatically
- **Error handling**: Extracts user-friendly error messages from various response formats
- **Usage**: All API calls (`auth.ts`, `pantry.ts`, `receipts.ts`) use this client

---

## Backend Technologies

### Spring Boot 3 + Java 17
**How it's used:**
- **REST API**: Controllers (`@RestController`) handle HTTP requests
- **Dependency Injection**: `@Autowired` injects services and repositories
- **Configuration**: `@Configuration` classes set up beans (DynamoDB client, S3 client, etc.)
- **Application properties**: `application.yml` configures ports, AWS settings, JWT secrets

### Spring Security + JWT
**How it's used:**
- **JWT Filter**: `JwtAuthenticationFilter` intercepts requests, extracts token from `Authorization` header
- **Token validation**: Validates JWT signature and expiration, extracts userId and email
- **Security context**: Sets authentication in Spring Security context for authorization checks
- **Protected endpoints**: `SecurityConfig` defines which routes require authentication
- **Password encoding**: Uses BCrypt to hash passwords before storing in DynamoDB
- **Example**: `/api/pantry/**` requires valid JWT token, `/api/auth/**` is public

### AWS DynamoDB
**How it's used:**
- **NoSQL database**: Stores Users, PantryItems, Receipts, Deals, ShoppingLists
- **Enhanced client**: Uses DynamoDB Enhanced Client for type-safe operations
- **Composite keys**: Uses partition key (userId) + sort key (productId/receiptId) pattern
- **Repositories**: Each domain has a repository (`PantryRepository`, `ReceiptRepository`) that handles CRUD
- **Query patterns**: Queries by userId (partition key), scans for email lookup (less efficient)
- **Example**: `PantryRepository.findByUserId()` queries all items for a user

### AWS S3
**How it's used:**
- **Receipt storage**: Stores uploaded receipt images/PDFs
- **Pre-signed URLs**: `S3Service.generatePresignedUploadUrl()` creates temporary upload URLs
- **Direct upload**: Frontend uploads directly to S3 (bypasses backend), then confirms with backend
- **Key structure**: `receipts/{userId}/{receiptId}.{ext}` organizes files by user
- **Example**: User uploads receipt → gets pre-signed URL → uploads to S3 → backend processes it

### AWS Textract
**How it's used:**
- **OCR processing**: `TextractService.processReceipt()` analyzes receipt images
- **AnalyzeExpense API**: Specifically designed for receipts - extracts line items, prices, totals
- **Async processing**: Receipts are processed asynchronously after upload
- **Product mapping**: Extracted text is mapped to canonical product names using fuzzy matching
- **Fallback**: If Textract fails (local dev), uses mock data
- **Example**: Receipt uploaded → Textract extracts "Milk $3.99" → Maps to "Milk" product → Updates pantry

### JWT (JJWT Library)
**How it's used:**
- **Token generation**: `JwtService.createToken()` creates access tokens (1 hour) and refresh tokens (7 days)
- **Claims**: Stores userId (subject), email, expiration in token payload
- **Signing**: Uses HMAC-SHA256 with secret key to sign tokens
- **Validation**: `validateToken()` checks signature and expiration
- **Refresh flow**: When access token expires, frontend uses refresh token to get new access token

---

## Infrastructure & DevOps

### Docker
**How it's used:**
- **Backend container**: Multi-stage build - compiles Java with Maven, runs Spring Boot app
- **Frontend container**: Builds React app with Vite, serves with nginx
- **DynamoDB Local**: Container runs local DynamoDB for development (no AWS needed)
- **Docker Compose**: Orchestrates all services - backend, frontend, DynamoDB start together

### Terraform
**How it's used:**
- **Infrastructure as Code**: Defines AWS resources (S3 buckets, DynamoDB tables, IAM roles)
- **Tables**: Creates DynamoDB tables with proper keys and indexes
- **S3 bucket**: Creates bucket for receipt storage with proper permissions
- **IAM**: Creates roles and policies for backend to access AWS services

### Vite Proxy
**How it's used:**
- **Development**: Routes `/api/*` requests from frontend (port 5173) to backend (port 8080)
- **CORS handling**: Backend handles CORS, proxy avoids CORS issues in development
- **Production**: Frontend built as static files, backend serves API separately

---

## Key Implementation Patterns

### Authentication Flow
1. User logs in → Backend validates credentials → Generates JWT tokens → Returns to frontend
2. Frontend stores tokens in Redux + localStorage
3. All API requests include `Authorization: Bearer <token>` header
4. Backend filter validates token → Extracts userId → Sets security context
5. On 401 error → Frontend automatically refreshes token using refresh token

### Receipt Processing Flow
1. Frontend requests pre-signed S3 URL from backend
2. Frontend uploads receipt image directly to S3
3. Frontend confirms upload → Backend creates Receipt record in DynamoDB
4. Backend triggers async Textract processing
5. Textract extracts text → Maps to products → Updates Pantry automatically

### State Management Pattern
- **Redux**: Global auth state (tokens, user info)
- **Local state**: Component-specific UI state (form inputs, loading states)
- **API calls**: Direct Axios calls, state updated via Redux actions
- **localStorage**: Persists auth tokens across page refreshes

### Database Pattern
- **Partition key**: Always userId (groups data by user)
- **Sort key**: ProductId, ReceiptId, etc. (allows querying user's items)
- **GSI**: Some tables use Global Secondary Indexes for alternative query patterns
- **Repository pattern**: Each domain has repository class handling DynamoDB operations
