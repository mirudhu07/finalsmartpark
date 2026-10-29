#!/bin/bash

echo "Stopping MongoDB..."
pkill -f "mongod.*27017" || true
echo "MongoDB stopped."
