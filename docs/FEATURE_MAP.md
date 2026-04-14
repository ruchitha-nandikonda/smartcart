# Feature map (live coding / new work)

Use this when you need to add something quickly: **where files go** and **what to touch**.

## Run locally (minimal)

1. **DB:** `./scripts/start-dynamodb.sh` (from repo root)  
2. **Backend:** `cd backend` → `SPRING_PROFILES_ACTIVE=local` + `JWT_SECRET=…` → `mvn spring-boot:run`  
3. **Frontend:** `cd frontend` → `npm ci` → `npm run dev` → http://localhost:5173  

API calls from the browser go to **`/api/...`**; Vite proxies to **port 8080**.

---

## Backend (Spring Boot)

**Base package:** `com.smartcart` under `backend/src/main/java/com/smartcart/`.

| You need | Typical place |
|----------|----------------|
| HTTP route (REST) | `…/<feature>/*Controller.java` |
| Business logic | `…/<feature>/service/*Service.java` |
| DynamoDB access | `…/<feature>/repository/*Repository.java` |
| Persisted shape | `…/<feature>/model/*.java` |
| Request/response JSON | `…/<feature>/dto/*.java` |

**Existing feature folders (copy patterns from here):** `auth`, `pantry`, `receipts`, `deals`, `shoppinglist`, `favorites`, `optimize`, `assistant`.

**Security:** New routes under `/api/...` usually need a rule in `common/config/SecurityConfig.java` (`permitAll` vs `authenticated`).

**Config:** `backend/src/main/resources/application.yml` and `application-local.yml`.

**Tests:** mirror package under `backend/src/test/java/...`.

---

## Frontend (React + Vite + Redux)

**Root:** `frontend/src/`.

| You need | Typical place |
|----------|----------------|
| Page / screen | `pages/*.tsx` |
| API calls | `api/<area>.ts` (uses `api/client.ts` for axios + auth header) |
| Redux slice | `store/*Slice.ts` (if global state is needed) |
| Routes | `App.tsx` |

**Auth:** Tokens and login state live in Redux (`authSlice`); API client attaches the JWT.

---

## Quick checklist for a full-stack feature

1. **Backend:** DTO → Controller endpoint → Service → Repository (if persisted).  
2. **SecurityConfig:** allow or protect the new path.  
3. **Frontend:** functions in `api/…` → call from page or hook → optional slice.  
4. **Smoke test:** happy path in UI + check Network tab for `/api/...`.

---

## Deeper docs

- Setup and deploy: root **README.md**  
- Long guides (email, tunnels, migrations): **docs/guides/**  
- Index: **docs/README.md**
