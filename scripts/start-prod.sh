#!/usr/bin/env bash
# Production: gunicorn (запускать за nginx/systemd)
set -euo pipefail
cd "$(dirname "$0")/../apps/backend"
source .venv/bin/activate
python manage.py migrate --noinput
python manage.py collectstatic --noinput
exec gunicorn furniture_store.wsgi:application \
  --bind 127.0.0.1:8000 \
  --workers 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
