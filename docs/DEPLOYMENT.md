# SmartPark AI — Deployment & Production Configuration

## 1. Environment Variables Configuration

Copy `.env.example` to `.env` in production:

```env
# Backend REST API
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb://user:password@mongo-host:27017/smartpark?authSource=admin
JWT_SECRET=super_secret_production_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=super_secret_production_refresh_token_key_32_chars
REFRESH_TOKEN_EXPIRES_IN=7d
ML_SERVICE_URL=http://ml-service:8000
FRONTEND_URL=https://admin.smartpark.ai
CORS_ORIGIN=https://admin.smartpark.ai

# ML Service
ML_PORT=8000
ML_ENV=production
MODEL_PATH=models/smartpark_occupancy_model.joblib
METADATA_PATH=models/model_metadata.json

# Admin Dashboard (Build-time)
VITE_API_URL=https://api.smartpark.ai/api/v1
VITE_SOCKET_URL=https://api.smartpark.ai

# Mobile Application (Build-time)
EXPO_PUBLIC_API_URL=https://api.smartpark.ai/api/v1
EXPO_PUBLIC_SOCKET_URL=https://api.smartpark.ai
```

## 2. Production Docker Multi-Container Architecture

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: always
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  ml-service:
    build:
      context: ./services/ml-service
      dockerfile: Dockerfile
    restart: always
    ports:
      - "8000:8000"

  backend:
    build:
      context: .
      dockerfile: services/backend/Dockerfile
    restart: always
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/smartpark
      - ML_SERVICE_URL=http://ml-service:8000
    ports:
      - "5001:5001"
    depends_on:
      - mongodb
      - ml-service

  admin-dashboard:
    build:
      context: ./apps/admin-dashboard
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"

volumes:
  mongo_data:
```

## 3. Production Readiness Checklist

- [x] Password hashing using bcrypt with 10 salt rounds.
- [x] Stateless JWT authentication with refresh token rotation.
- [x] Role-based authorization middleware protecting administrative endpoints.
- [x] Real-time WebSockets with connection monitoring.
- [x] Input validation on all endpoints using Zod schemas.
- [x] Rate limiting on authentication routes.
- [x] Centralized error handler without stack trace leaks.
- [x] Out-of-sample temporal holdout model evaluation against baseline.
