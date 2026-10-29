#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

mkdir -p .mongodb/data/db

# Check if mongod is already running on port 27017
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null ; then
    echo "MongoDB is already running on port 27017."
    exit 0
fi

echo "Starting local MongoDB 7.0 daemon..."
.mongodb/bin/mongod --dbpath .mongodb/data/db --port 27017 --fork --logpath .mongodb/mongod.log
echo "MongoDB started on port 27017 with persistent WiredTiger storage in .mongodb/data/db."
