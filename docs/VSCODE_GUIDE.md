# SmartPark AI — Running in Visual Studio Code

This guide explains how to open, run, debug, and test the entire **SmartPark AI** ecosystem directly inside Visual Studio Code.

---

## 🌟 Quick Overview of Pre-Configured VS Code Tools

The workspace contains dedicated configurations inside the [`.vscode/`](file:///Users/mirudhusanjeevini/Desktop/SmartPark/.vscode) folder:

| File | Purpose |
| :--- | :--- |
| [`.vscode/tasks.json`](file:///Users/mirudhusanjeevini/Desktop/SmartPark/.vscode/tasks.json) | 1-Click tasks to start MongoDB, ML Service, Backend API, Admin Dashboard, Metro, and run health checks. |
| [`.vscode/launch.json`](file:///Users/mirudhusanjeevini/Desktop/SmartPark/.vscode/launch.json) | **F5** Debugger configurations for Backend Node.js API and Python FastAPI ML service with breakpoint support. |
| [`.vscode/settings.json`](file:///Users/mirudhusanjeevini/Desktop/SmartPark/.vscode/settings.json) | Points VS Code Python interpreter to `services/ml-service/venv/bin/python`. |

---

## 🚀 Option 1: The 1-Click Method (VS Code Tasks)

The easiest way to run everything or individual parts is using VS Code's built-in Task runner:

1. Open the workspace root (`/Users/mirudhusanjeevini/Desktop/SmartPark`) in VS Code:
   ```bash
   code /Users/mirudhusanjeevini/Desktop/SmartPark
   ```
2. Press **`Cmd + Shift + P`** (macOS) or **`Ctrl + Shift + P`** (Windows/Linux) to open the Command Palette.
3. Type:
   ```text
   Tasks: Run Task
   ```
   and press **Enter**.
4. You will see the list of pre-configured SmartPark tasks:
   - **`SmartPark: 0. Start All Services (All-in-One)`** *(Starts DB + ML + API + Admin + Metro in a single unified terminal)*
   - **`SmartPark: 1. Start MongoDB`** *(Starts the local persistent WiredTiger daemon on port 27017)*
   - **`SmartPark: 2. Seed Database`** *(Populates 4 SF garages, test accounts, and active bookings)*
   - **`SmartPark: 3. Start ML Service (Port 8000)`** *(Starts FastAPI demand forecast service)*
   - **`SmartPark: 4. Start Backend (Port 5001)`** *(Starts Express REST API with TypeScript)*
   - **`SmartPark: 5. Start Admin Dashboard (Port 5173)`** *(Starts Vite web dashboard)*
   - **`SmartPark: 6. Start Mobile App (Port 8081)`** *(Starts Expo Metro Bundler for driver app)*
   - **`SmartPark: Check System Health`** *(Runs immediate live status check across all ports)*
   - **`SmartPark: Run All Tests`** *(Executes all 23 unit and integration tests)*

> [!TIP]
> **Keyboard Shortcut for Default Build Task**:
> Press **`Cmd + Shift + B`** (macOS) or **`Ctrl + Shift + B`** to immediately trigger **`SmartPark: 0. Start All Services`**!

---

## 💻 Option 2: All-in-One Terminal Command (`npm start`)

If you prefer a single terminal window inside VS Code:

1. Open a new terminal inside VS Code (**`Ctrl + \``** or **`Terminal -> New Terminal`**).
2. Run:
   ```bash
   npm start
   ```
   *(or `npm run dev:all`)*

This command uses `concurrently` to spin up all 4 microservices side-by-side with color-coded log streams:
- `[ML]` *(Magenta)*: FastAPI Forecasting on `http://localhost:8000`
- `[API]` *(Blue)*: Express REST API on `http://localhost:5001`
- `[ADMIN]` *(Cyan)*: Vite Admin Dashboard on `http://localhost:5173`
- `[METRO]` *(Green)*: Expo Metro Bundler on `http://localhost:8081`

---

## 🖥️ Option 3: Split Terminals (Individual Services)

To run each service in its own dedicated tab or split pane inside VS Code's Integrated Terminal:

### 1. Terminal 1 — MongoDB & ML Service
```bash
# 1. Start MongoDB daemon (runs in background on port 27017)
bash scripts/start-mongo.sh

# 2. (Optional) Re-seed test data
npm run seed:backend

# 3. Start Python FastAPI ML service
npm run start:ml
```
*Health check URL*: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Terminal 2 — Backend REST API
Click the **`+`** icon in the terminal panel to open a second terminal:
```bash
npm run dev:backend
```
*Health check URL*: [http://localhost:5001/api/v1/health](http://localhost:5001/api/v1/health)

### 3. Terminal 3 — Admin Dashboard (Web)
Click the **`+`** icon to open a third terminal:
```bash
npm run dev:admin
```
*Open in browser*: [http://localhost:5173](http://localhost:5173)

### 4. Terminal 4 — Driver Mobile Application (Expo)
Click the **`+`** icon to open a fourth terminal:
```bash
npm run dev:mobile:metro
```
- Press **`i`** to open the app automatically in the **iOS Simulator**.
- Press **`a`** to open in an **Android Emulator**.
- Scan the QR code with **Expo Go** on your physical iPhone or Android device.

---

## 🐞 Option 4: Step-Through Debugging with Breakpoints (F5)

You can set breakpoints directly in TypeScript or Python files:

1. Open the **Run and Debug** view in VS Code (**`Cmd + Shift + D`**).
2. Choose one of the debug configurations from the dropdown:
   - **`Debug Backend API (Port 5001)`**: Launches the Node.js Express server with source maps enabled. Place breakpoints anywhere in [`services/backend/src/`](file:///Users/mirudhusanjeevini/Desktop/SmartPark/services/backend/src).
   - **`Debug ML Service (FastAPI)`**: Launches `uvicorn` using the virtual environment interpreter (`services/ml-service/venv`). Place breakpoints in [`services/ml-service/main.py`](file:///Users/mirudhusanjeevini/Desktop/SmartPark/services/ml-service/main.py).
3. Press **`F5`** to start debugging.

---

## 🔑 Test Accounts & Demo Credentials

Use any of these pre-seeded test accounts to log into the Admin Dashboard or Mobile App:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@smartpark.ai` | `Admin@123456` |
| **Facility Operator** | `operator@smartpark.ai` | `Operator@123456` |
| **Driver / End User** | `driver@smartpark.ai` | `Driver@123456` |

---

## 🩺 System Health Verification

Whenever you want to check whether all ports and services are online, run from VS Code:

```bash
node scripts/health-check.js
```

Or via VS Code Task:
`Cmd + Shift + P` -> `Tasks: Run Task` -> `SmartPark: Check System Health`

Expected output when running:
```text
--------------------------------------------------
 SMARTPARK AI — RUNTIME SERVICE HEALTH REPORT     
--------------------------------------------------
✓ [ONLINE] ML Forecasting Service     -> http://localhost:8000/health
✓ [ONLINE] ML Readiness               -> http://localhost:8000/ready
✓ [ONLINE] Backend REST API           -> http://localhost:5001/api/v1/health
✓ [ONLINE] Backend DB Readiness       -> http://localhost:5001/api/v1/ready
✓ [ONLINE] Admin Dashboard (Vite)     -> http://localhost:5173/
✓ [ONLINE] Expo Metro Bundler         -> http://localhost:8081/
--------------------------------------------------
```

---

## 🧪 Running Automated Tests

Run the full test suite across Backend (Vitest), ML (Pytest), and Mobile (Vitest):

```bash
npm test
```
All **23 unit & integration tests** will execute and report results.
