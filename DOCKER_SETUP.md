# Docker Setup Guide

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### Build and Run

```bash
# Build all images
docker compose build

# Start all services
docker compose up

# Or run in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Services

### Backend (Spring Boot)
- **Port**: 8080
- **Health Check**: http://localhost:8080/actuator/health
- **API**: http://localhost:8080/api

### Frontend (React/Vite)
- **Port**: 5173
- **URL**: http://localhost:5173

### DynamoDB Local
- **Port**: 8000
- **Web Shell**: http://localhost:8000/shell (if available)

## Environment Variables

### Backend
- `AWS_REGION` - AWS region (default: us-east-1)
- `DYNAMO_ENDPOINT` - DynamoDB endpoint (default: http://dynamodb-local:8000)
- `S3_BUCKET` - S3 bucket name (default: smartcart-receipts-dev)
- `JWT_SECRET` - JWT secret key
- `JWT_ACCESS_TOKEN_EXPIRATION` - Access token expiration (ms)
- `JWT_REFRESH_TOKEN_EXPIRATION` - Refresh token expiration (ms)

## Development Workflow

### Running Locally (without Docker)
```bash
# Terminal 1: Start DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local

# Terminal 2: Start Backend
cd backend && mvn spring-boot:run

# Terminal 3: Start Frontend
cd frontend && npm run dev
```

### Running with Docker Compose
```bash
# All-in-one startup
docker compose up

# Rebuild after code changes
docker compose build --no-cache
docker compose up
```

## Production Considerations

1. **Environment Variables**: Set all secrets via environment variables or secrets manager
2. **Health Checks**: Use health check endpoints for orchestration
3. **Resource Limits**: Add resource limits in docker-compose.yml:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```
4. **Networking**: Use named networks for better isolation
5. **Volumes**: Consider named volumes for persistent data

## Troubleshooting

### Backend won't start
- Check DynamoDB Local is running: `curl http://localhost:8000`
- Check logs: `docker compose logs backend`
- Verify environment variables are set correctly

### Frontend build fails
- Clear node_modules: `rm -rf frontend/node_modules`
- Rebuild: `docker compose build --no-cache frontend`

### DynamoDB connection issues
- Ensure `DYNAMO_ENDPOINT` matches the service name `dynamodb-local`
- Check network connectivity: `docker compose exec backend ping dynamodb-local`

## File Structure

```
smartcart/
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
└── .dockerignore
```









