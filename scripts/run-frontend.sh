#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/frontend"

echo "Frontend: http://localhost:3000"
npm run dev
