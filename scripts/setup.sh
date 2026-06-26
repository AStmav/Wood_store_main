#!/usr/bin/env bash
# Первичная настройка проекта (venv, зависимости, миграции)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/apps/backend"
FRONTEND="$ROOT/apps/frontend"

echo "==> Backend: виртуальное окружение"
cd "$BACKEND"
python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f .env ]; then
  cp env.example .env
  echo "Создан $BACKEND/.env — отредактируйте при необходимости"
elif grep -q '@db:' .env 2>/dev/null; then
  echo "ВНИМАНИЕ: в .env указан Docker-хост db в DATABASE_URL."
  echo "Закомментируйте DATABASE_URL для SQLite или укажите 127.0.0.1"
fi

python manage.py migrate
python manage.py collectstatic --noinput

echo "==> Frontend: зависимости"
cd "$FRONTEND"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Создан $FRONTEND/.env"
fi

echo ""
echo "Готово. Запуск: ./scripts/dev.sh"
