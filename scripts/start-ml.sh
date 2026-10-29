#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR/services/ml-service"

echo "Starting SmartPark ML Service on port 8000..."
exec ./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info
