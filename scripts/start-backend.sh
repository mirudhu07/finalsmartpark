#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR/services/backend"

echo "Starting SmartPark REST API on port 5001..."
exec npx tsx src/index.ts
