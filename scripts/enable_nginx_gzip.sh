#!/usr/bin/env bash
# Применить gzip + cache headers на VPS (запускать на сервере от root).
set -euo pipefail

NGINX_MAIN="${NGINX_MAIN:-/etc/nginx/nginx.conf}"
SITE_CONF_SRC="/opt/wood_store/nginx/conf.d/default.conf"

echo "==> Checking gzip in $NGINX_MAIN"
if ! grep -qE '^\s*gzip on;' "$NGINX_MAIN"; then
  echo "WARNING: gzip on; not found in $NGINX_MAIN"
  echo "Add gzip block from /opt/wood_store/nginx/nginx.conf into http { } section."
else
  echo "gzip on; present"
fi

if [[ -f "$SITE_CONF_SRC" ]]; then
  # Типичные пути site-config
  for dest in \
    /etc/nginx/sites-available/skazkindomykt.ru \
    /etc/nginx/sites-available/wood_store \
    /etc/nginx/conf.d/default.conf
  do
    if [[ -f "$dest" ]]; then
      cp -a "$dest" "${dest}.bak.$(date +%Y%m%d%H%M%S)"
      cp "$SITE_CONF_SRC" "$dest"
      echo "Updated $dest from repo"
    fi
  done
fi

# Если сайт лежит в sites-enabled как симлинк на другой файл — подсказка
echo "==> Active nginx site files:"
ls -la /etc/nginx/sites-enabled 2>/dev/null || true
ls -la /etc/nginx/conf.d 2>/dev/null || true

nginx -t
systemctl reload nginx

echo "==> Verify compression:"
curl -sI -H 'Accept-Encoding: gzip' https://skazkindomykt.ru/assets/index-3ff164e7.js | tr -d '\r' | grep -iE 'HTTP/|content-encoding|content-length|cache-control|expires' || true
