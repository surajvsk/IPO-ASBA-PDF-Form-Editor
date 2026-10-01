#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v java >/dev/null 2>&1; then
  echo "Java 17 or newer is required."
  exit 1
fi

if [[ ! -f backend/target/asba-print.war ]]; then
  if ! command -v mvn >/dev/null 2>&1; then
    echo "Maven is required to create backend/target/asba-print.war"
    exit 1
  fi
  echo "Building the print service..."
  (cd backend && mvn -q package)
fi

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting the print service at http://localhost:8080"
java -jar backend/target/asba-print.war &
BACKEND_PID=$!

if [[ ! -d frontend/node_modules ]]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo "Starting the editor at http://localhost:3000"
cd frontend
npm start
