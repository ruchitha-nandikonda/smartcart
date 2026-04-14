# SmartCart

Household pantry tracking, meal planning, and grocery optimization — **React + Vite** frontend, **Spring Boot** backend, **DynamoDB** data store.

<p align="center">
  <a href="https://smartcart-phi.vercel.app/">Open app</a> ·
  <a href="https://smartcart-backend-zy2c.onrender.com/actuator/health">API health</a> ·
  <a href="#quick-start-local">Run locally</a>
</p>

---

## At a glance

| | |
|---|--|
| **What it does** | Pantry, receipts, deals, meal favorites, shopping lists, and an assistant — all per user. |
| **Sign in** | **Username + password** (no email verification step). New accounts get JWT tokens right after signup. |
| **Frontend** | [smartcart-phi.vercel.app](https://smartcart-phi.vercel.app/) |
| **Backend** | [smartcart-backend-zy2c.onrender.com](https://smartcart-backend-zy2c.onrender.com/) |
| **Stack** | Java 17+ / Spring Boot 3 · React 18 · Vite · DynamoDB · Docker (optional local DB) |

---

## Tech stack

What the project uses end-to-end, and what to install on your machine to develop.

### Prerequisites (local development)

| Tool | Role | Notes |
|------|------|--------|
| **JDK 17+** | Run & compile backend | Spring Boot parent targets Java 17; newer LTS JDKs usually work |
| **Maven 3.9+** | Backend build | `mvn spring-boot:run`, `mvn package` |
| **Node.js 20+** | Frontend toolchain | Matches CI; includes `npm` |
| **Docker Desktop** | Local DynamoDB | Required for the default local flow unless you use real AWS credentials |
| **Git** | Version control | — |

### Backend (`backend/`)

| Layer | Technology |
|-------|------------|
| Runtime / build | **Java 17**, **Maven** |
| Framework | **Spring Boot 3.3** |
| API | **Spring Web** (REST), **Spring Validation** |
| Security | **Spring Security**, **JWT** (JJWT 0.12.x), **BCrypt** |
| Data | **Amazon DynamoDB** via **AWS SDK for Java v2** (enhanced client) |
| Other AWS (features) | **S3**, **Textract**, **SES** (receipts, mail infrastructure) |
| Email (optional) | **Spring Mail**, **SendGrid** SDK |
| Ops | **Spring Actuator**, **Micrometer** (+ CloudWatch registry), **Bucket4j** (rate limiting) |
| Tests | **JUnit 5**, **Spring Boot Test**, **Testcontainers** |

### Frontend (`frontend/`)

| Layer | Technology |
|-------|------------|
| UI | **React 18**, **TypeScript** |
| Build / dev | **Vite 5** |
| Routing | **React Router 6** |
| State | **Redux Toolkit**, **React Redux** |
| HTTP | **Axios** |
| Styling | **Tailwind CSS 3**, PostCSS |
| Icons | **react-icons** |
| E2E (optional) | **Playwright** |

### Cloud & delivery

| Concern | Typical choice in this repo |
|---------|----------------------------|
| Frontend hosting | **Vercel** (static Vite build) |
| Backend hosting | **Render** (Docker image from `backend/Dockerfile`; see `render.yaml`) |
| Database (prod) | **AWS DynamoDB** |
| CI | **GitHub Actions** — Java 17 + Maven on `backend/`, Node 20 + `npm ci` / build on `frontend/` |

<details>
<summary><strong>Auth & data model (quick reference)</strong></summary>

- **Sign-in:** username + password; **JWT** access + refresh returned after register/login.  
- **User record:** username is stored in DynamoDB under the legacy attribute name `email` for table compatibility.  
- **Local DB:** DynamoDB Local (in-memory) via Docker; backend **`local`** Spring profile sets `http://127.0.0.1:8000`.

</details>

---

## Table of contents

1. [Tech stack](#tech-stack)  
2. [Quick start (local)](#quick-start-local)  
3. [Repository layout](#repository-layout)  
4. [Configuration cheat sheet](#configuration-cheat-sheet)  
5. [Deployments](#deployments)  
6. [Releases & tags](#releases--tags)  
7. [Troubleshooting](#troubleshooting)  
8. [More documentation](#more-documentation)  

---

## Quick start (local)

Follow these in order. The backend needs **DynamoDB Local** unless you use real AWS keys.

### 1. Start the database

<details>
<summary><strong>Docker (recommended)</strong></summary>

From the **repository root**:

```bash
./scripts/start-dynamodb.sh
```

Or:

```bash
docker compose up dynamodb-local -d
```

DynamoDB listens on **http://127.0.0.1:8000**.  
If Docker is not running, start Docker Desktop first, then retry.

</details>

<details>
<summary><strong>One-liner (no compose file)</strong></summary>

```bash
docker run -p 8000:8000 amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -inMemory -sharedDb
```

</details>

### 2. Start the backend

```bash
cd backend
export SPRING_PROFILES_ACTIVE=local
export JWT_SECRET=your-local-secret-at-least-32-chars-long
mvn spring-boot:run
```

- **Health:** http://localhost:8080/actuator/health  
- **`local` profile** points DynamoDB at `http://127.0.0.1:8000` (`application-local.yml`).  
- Alternatively set `DYNAMO_ENDPOINT=http://127.0.0.1:8000` instead of the profile.

### 3. Start the frontend

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173** — the dev server **proxies `/api` → `localhost:8080`**.

### 4. Smoke test

1. Go to **Login** → switch to sign up.  
2. Pick a **username** (3–64 chars; see backend validation) and **password** (min 6 chars).  
3. You should land in the app with tokens stored; no OTP step.

---

## Repository layout

```
smartcart/
├── backend/          # Spring Boot API (Dockerfile for Render)
├── frontend/         # Vite + React (Vercel)
├── scripts/          # Shell helpers (run from repo root, e.g. ./scripts/start-dynamodb.sh)
├── docs/
│   ├── guides/       # Deep-dive guides (deploy, email, tunnels, migrations)
│   └── FEATURE_MAP.md  # Where to add API + UI code (good for interviews)
├── tools/            # Small Python helpers (deals / data)
├── docker-compose.yml
└── render.yaml       # Render service hint (backend)
```

---

## Configuration cheat sheet

<details>
<summary><strong>Frontend (Vercel / production build)</strong></summary>

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Full API base **including `/api`**, e.g. `https://smartcart-backend-zy2c.onrender.com/api` |

If unset locally, the app uses relative `/api` (works with Vite proxy).

</details>

<details>
<summary><strong>Backend (local)</strong></summary>

| Variable / profile | Purpose |
|--------------------|---------|
| `SPRING_PROFILES_ACTIVE=local` | Sets DynamoDB endpoint to `127.0.0.1:8000` |
| `JWT_SECRET` | Signing key for JWTs (use a long random string) |
| `DYNAMO_ENDPOINT` | Override Dynamo URL (optional if using `local` profile) |

</details>

<details>
<summary><strong>Backend (production / Render)</strong></summary>

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Required; strong secret |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Real DynamoDB access |
| `EMAIL_OUTBOUND_ENABLED`, SendGrid/Gmail/SES vars | Only if you turn email back on |

Do **not** set `DYNAMO_ENDPOINT` to localhost in production.

</details>

---

## Deployments

| Surface | URL | How it updates |
|---------|-----|----------------|
| Frontend | [smartcart-phi.vercel.app](https://smartcart-phi.vercel.app/) | Push to `main` (if Git integration on) or deploy from `frontend/` |
| Backend | [smartcart-backend-zy2c.onrender.com](https://smartcart-backend-zy2c.onrender.com/) | Push to `main`; Docker build from `backend/` per `render.yaml` |

**After backend changes:** ensure Render env vars match (especially `JWT_SECRET` and AWS credentials).  
**After frontend changes:** set `VITE_API_BASE_URL` on Vercel to your backend **`…/api`** URL, then redeploy so the build picks it up.

<details>
<summary><strong>Optional: email / SendGrid (advanced)</strong></summary>

Outbound email is **off by default** in config unless you enable a provider. Historically the project used SendGrid for OTP; auth is now username/password without email verification. If you re-enable mail for other features, configure `EMAIL_OUTBOUND_ENABLED` and your provider keys on Render and align `SENDGRID_FROM_EMAIL` with a verified sender.

</details>

---

## Releases & tags

| Version | Date | Notes |
|---------|------|-------|
| v1.0.0 | 2025-11-14 | First production-oriented release (earlier mail/OTP-oriented notes in tags/docs). |

```bash
git tag -a v1.x.x -m "Describe the release"
git push origin v1.x.x
```

---

## Troubleshooting

<details>
<summary><strong>Signup / login fails with “Connection refused”</strong></summary>

The API cannot reach DynamoDB. Start DynamoDB Local on **port 8000**, use `SPRING_PROFILES_ACTIVE=local` (or `DYNAMO_ENDPOINT`), then **restart** the backend so tables can be created.

</details>

<details>
<summary><strong>Production app can’t reach API</strong></summary>

Check **Vercel** `VITE_API_BASE_URL` ends with `/api` and matches your live backend URL. Check **Render** logs and `/actuator/health`.

</details>

<details>
<summary><strong>CORS errors</strong></summary>

The backend allows broad origin patterns for development and common hosting; if you add a new frontend domain, confirm requests hit the correct backend base URL and that preflight succeeds from the browser network tab.

</details>

---

## More documentation

- **Adding a feature (where code goes):** [`docs/FEATURE_MAP.md`](docs/FEATURE_MAP.md)  
- **Guide index:** [`docs/README.md`](docs/README.md) — includes links to [`docs/guides/`](docs/guides/) (deploy, email, tunnels, migrations, troubleshooting).

**Suggested next improvements for the product** (track as issues):

1. Optional email verification or password recovery hardening for production.  
2. API rate-limit tuning for heavy testers.  
3. CI health checks beyond build (e.g. smoke test against staging).

---

*Questions or setup help — open an issue with what you tried and the exact error message.*
