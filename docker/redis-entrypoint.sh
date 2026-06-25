#!/bin/sh
set -e

# Если пароль указан, запускаем Redis с паролем
if [ -n "$REDIS_PASSWORD" ]; then
    echo "Starting Redis with password authentication..."
    exec redis-server --requirepass "$REDIS_PASSWORD"
else
    echo "WARNING: REDIS_PASSWORD is not set. Starting Redis without password (NOT RECOMMENDED for production)."
    exec redis-server
fi







