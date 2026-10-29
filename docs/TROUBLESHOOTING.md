# SmartPark AI — Troubleshooting & Diagnostics Guide

## 1. Quick Runtime Health Check

To inspect the live status of all system components:
```bash
node scripts/health-check.js
```
Expected output:
```
✓ [ONLINE] ML Forecasting Service     -> http://localhost:8000/health
✓ [ONLINE] ML Readiness               -> http://localhost:8000/ready
✓ [ONLINE] Backend REST API           -> http://localhost:5001/api/v1/health
✓ [ONLINE] Backend DB Readiness       -> http://localhost:5001/api/v1/ready
✓ [ONLINE] Admin Dashboard (Vite)     -> http://localhost:5173/
✓ [ONLINE] Expo Metro Bundler         -> http://localhost:8081/
```

## 2. MongoDB Local Daemon

### Starting MongoDB
```bash
bash scripts/start-mongo.sh
```
MongoDB is packaged inside the workspace at `.mongodb/bin/mongod` and stores data in `.mongodb/data/db`.

### Stopping MongoDB
```bash
bash scripts/stop-mongo.sh
```

### Port Conflict (Port 27017 in use)
```bash
lsof -i :27017
pkill -f mongod
```

## 3. Expo Metro Bundler Troubleshooting

### Telemetry / Permission Error (`EPERM: ~/.expo/state.json`)
Expo CLI tries by default to write user telemetry to `~/.expo/`. In restricted or sandboxed environments, disable telemetry:
```bash
export EXPO_NO_TELEMETRY=1
```

### Native Modules Cache (`EPERM: ~/.expo/native-modules-cache`)
Redirect Expo cache inside the project directory:
```bash
export EXPO_CACHE_DIR="$(pwd)/.expo-cache"
```

### Clearing Bundler Cache
```bash
cd apps/mobile
npx expo start -c
```

### Opening iOS Simulator
```bash
# Check available simulators
xcrun simctl list devices available

# Boot specific simulator
xcrun simctl boot "iPhone 16e"
open -a Simulator
```

## 4. Machine-Learning Service

### Retraining Forecasting Model
```bash
cd services/ml-service
./venv/bin/python train.py
```
This updates `services/ml-service/models/smartpark_occupancy_model.joblib` and `model_metadata.json`.

### Verifying ML Service
```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/ready
```

## 5. Seed Database Script

To reset and re-seed facilities, users, vehicles, and active bookings:
```bash
npm run seed:backend
```
Seeded Test Accounts:
- **Admin**: `admin@smartpark.ai` / `Admin@123456`
- **Operator**: `operator@smartpark.ai` / `Operator@123456`
- **Driver**: `driver@smartpark.ai` / `Driver@123456`
