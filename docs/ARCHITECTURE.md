# SmartPark AI — System Architecture & Design Specification

## 1. Architectural Overview

SmartPark AI is an end-to-end smart parking platform designed for drivers and facility operators. It connects mobile drivers, garage management operations, and machine-learning demand forecasting.

```
                              +-------------------------+
                              |   Driver Mobile App     |
                              |   (React Native/Expo)   |
                              +------------+------------+
                                           |
                                HTTP / WSS |
                                           v
+--------------------------+  HTTP / JSON  +--------------------------+  Socket.IO  +--------------------------+
|  Admin Web Dashboard     | <-----------> |  Backend REST API        | <---------> |  Connected Clients       |
|  (React 18 / Vite / TS)  |               |  (Express / TypeScript)  |             |  (Mobile & Web Drivers)  |
+--------------------------+               +------------+-------------+             +--------------------------+
                                                        |
                                          +-------------+-------------+
                                          |                           |
                                          v                           v
                             +------------------------+  +--------------------------+
                             |  Persistent Database   |  |  ML Prediction Service   |
                             |  MongoDB 7.0 WiredTiger|  |  FastAPI / Scikit-Learn  |
                             +------------------------+  +--------------------------+
```

## 2. Core Components

### 2.1 Mobile Application (`apps/mobile`)
- **Framework**: React Native 0.76.7, Expo SDK 52.0.49 with Expo Router v4.
- **State Management**: Zustand for auth, facilities, and active bookings.
- **Location & Sensors**: `expo-location` for GPS positioning and distance calculation.
- **Credential Storage**: `expo-secure-store` for JWT access tokens.
- **Navigation**: Dual-mode navigation:
  - Outdoor GPS: Routes to verified facility entrance coordinates using Apple Maps (`maps://`) or Google Maps (`geo:`).
  - Indoor Guidance: Displays stored floor, zone, and bay number with landmark references.
- **Official Brand Assets**: Authoritative 1024x1024 brand logo integrated into App Icon, Splash, Adaptive Icon, and in-app headers.

### 2.2 REST API Backend (`services/backend`)
- **Runtime**: Node.js v22 LTS with Express & TypeScript.
- **Database**: MongoDB 7.0 with persistent WiredTiger engine in `.mongodb/data/db`.
- **Validation**: Schema validation via Zod schemas shared from `@smartpark/shared`.
- **Security**:
  - Passwords hashed with `bcryptjs`.
  - Stateless JWT access tokens + refresh tokens.
  - Role-based authorization (`driver`, `operator`, `admin`).
  - Security headers via `helmet`.
  - Rate limiting on authentication endpoints.
- **Real-Time Layer**: Socket.IO broadcasting `occupancy:update`, `reservation:update`, and `facility:update`.

### 2.3 Machine-Learning Prediction Service (`services/ml-service`)
- **Framework**: Python 3.14 with FastAPI and Uvicorn.
- **Model**: `GradientBoostingRegressor` (120 estimators, max depth 5).
- **Features**: Diurnal hour, minute, day of week, weekend indicator, current occupancy ratio, horizon distance (15, 30, 45, 60 mins), and facility capacity.
- **Evaluation**: Evaluated on an out-of-sample temporal holdout split (last 20% of time-series):
  - Model Test MAE: **4.04%**
  - Model Test RMSE: **5.55%**
  - Persistence Baseline MAE: **6.21%**
  - Relative Error Reduction: **+34.9%** over naive persistence.
- **Endpoints**: `GET /health`, `GET /ready`, `POST /predict`, `POST /predict/batch`, `GET /models/metadata`.

### 2.4 Administration Dashboard (`apps/admin-dashboard`)
- **Framework**: React 18 with Vite and TypeScript.
- **UI & Visualization**: Recharts for live occupancy distributions and forecast vs measured charts.
- **Features**:
  - Live system KPIs (total capacity, occupied bays, system load, active reservations).
  - Facility CRUD with coordinate configuration.
  - Live occupancy override with instant WebSocket broadcast.
  - Operational incident reporting and resolution workflow.
  - Security audit logs.
