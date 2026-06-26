#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../apps/backend"
source .venv/bin/activate
exec celery -A furniture_store worker --loglevel=info
