#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../apps/frontend"
exec npm run dev
