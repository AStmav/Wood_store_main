#!/usr/bin/env bash
# Локальная разработка: backend + frontend
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/apps/backend"
FRONTEND="$ROOT/apps/frontend"

cleanup() {
  trap - EXIT INT TERM
  [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "${FRONTEND_PID:-}" ] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$BACKEND"
# shellcheck disable=SC1091
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://localhost:8000"
echo "Admin:    http://localhost:8000/admin/"
echo "Frontend: http://localhost:3000"
echo "Ctrl+C — остановить"
echo ""

wait
