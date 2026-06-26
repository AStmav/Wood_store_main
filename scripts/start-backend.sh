#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../apps/backend"
source .venv/bin/activate
exec python manage.py runserver 0.0.0.0:8000
