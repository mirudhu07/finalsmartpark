#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "========================================================"
echo " SMARTPARK AI — FULL PLATFORM TEST SUITE                "
echo "========================================================"

echo ""
echo ">> [1/4] Running ML Microservice Tests (pytest)..."
cd "$DIR/services/ml-service"
./venv/bin/pytest test_ml_service.py
echo "✓ ML Microservice: All tests passed!"

echo ""
echo ">> [2/4] Running Backend REST API Tests (vitest)..."
cd "$DIR/services/backend"
npm test
echo "✓ Backend REST API: All 10 tests passed!"

echo ""
echo ">> [3/4] Running Mobile Application Logic Tests (vitest)..."
cd "$DIR"
npx vitest run apps/mobile/src/__tests__/mobile.test.ts
echo "✓ Mobile Application: All 7 tests passed!"

echo ""
echo ">> [4/4] Verifying TypeScript Across All Workspaces..."
cd "$DIR/packages/shared" && npx tsc --noEmit
cd "$DIR/services/backend" && npx tsc --noEmit
cd "$DIR/apps/admin-dashboard" && npx tsc --noEmit
cd "$DIR/apps/mobile" && npx tsc --noEmit
echo "✓ TypeScript: 0 compilation errors across all projects!"

echo ""
echo "========================================================"
echo " ALL TESTS AND TYPECHECKS PASSED WITH 100% SUCCESS!    "
echo "========================================================"
