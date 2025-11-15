# Инструкция по развертыванию Wood Project

## Быстрый старт для разработки

1. **Скопируйте файлы переменных окружения:**
```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

2. **Отредактируйте `.env` файлы:**
   - Обновите пароли и ключи
   - Настройте `VITE_API_URL` для фронтенда

3. **Запустите проект:**
```bash
docker-compose up -d
```

4. **Создайте суперпользователя:**
```bash
docker-compose exec backend python manage.py createsuperuser
```

5. **Откройте в браузере:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin: http://localhost:8000/admin
   - Swagger: http://localhost:8000/swagger

## Production развертывание

### 1. Подготовка сервера

**Требования:**
- Ubuntu 20.04+ или Debian 11+
- Docker и Docker Compose установлены
- Минимум 2GB RAM, 20GB диск

**Установка Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Настройка проекта на сервере

```bash
# Клонируйте репозиторий
git clone <your-repo-url> wood_project
cd wood_project

# Скопируйте файлы переменных окружения
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

### 3. Настройка переменных окружения

**`.env` (корневой):**
```env
POSTGRES_DB=wood_shop
POSTGRES_USER=wood_user
POSTGRES_PASSWORD=strong_secure_password_here
REDIS_PASSWORD=strong_redis_password_here
HTTP_PORT=80
HTTPS_PORT=443
VITE_API_URL=https://your-domain.com
```

**`apps/backend/.env`:**
```env
SECRET_KEY=generate-strong-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,api.your-domain.com
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHANNEL_ID=your-telegram-channel-id

# Если используете внешнюю БД
# DATABASE_URL=postgres://user:password@host:5432/dbname
```

**Генерация SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Настройка SSL (Let's Encrypt)

**Установка Certbot:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

**Получение сертификата:**
```bash
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

**Копирование сертификатов в проект:**
```bash
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem
```

**Обновите `nginx/conf.d/default.conf`:**
- Раскомментируйте секцию HTTPS сервера
- Замените `your-domain.com` на ваш домен

### 5. Запуск production

```bash
# Сборка и запуск
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Выполнение миграций
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Сборка статических файлов
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Создание суперпользователя
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### 6. Настройка автозапуска

**Создайте systemd сервис:**
```bash
sudo nano /etc/systemd/system/wood-project.service
```

**Содержимое:**
```ini
[Unit]
Description=Wood Project
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/wood_project
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

**Активация:**
```bash
sudo systemctl enable wood-project.service
sudo systemctl start wood-project.service
```

## Обслуживание

### Обновление проекта

```bash
# Остановка
docker-compose -f docker-compose.prod.yml down

# Обновление кода
git pull

# Пересборка и запуск
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Миграции
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Статика
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Логи

```bash
# Все логи
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Резервное копирование БД

```bash
# Создание бэкапа
docker-compose -f docker-compose.prod.yml exec db pg_dump -U wood_user wood_shop > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
docker-compose -f docker-compose.prod.yml exec -T db psql -U wood_user wood_shop < backup_file.sql
```

### Мониторинг

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats
```

## Решение проблем

### Контейнер не запускается

```bash
# Проверка логов
docker-compose -f docker-compose.prod.yml logs [service_name]

# Перезапуск сервиса
docker-compose -f docker-compose.prod.yml restart [service_name]
```

### Проблемы с подключением к БД

```bash
# Проверка статуса БД
docker-compose -f docker-compose.prod.yml exec db pg_isready -U wood_user

# Подключение к БД
docker-compose -f docker-compose.prod.yml exec db psql -U wood_user wood_shop
```

### Проблемы с nginx

```bash
# Проверка конфигурации
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Перезагрузка конфигурации
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Структура портов

**Development:**
- Frontend: 3000
- Backend: 8000
- PostgreSQL: 5432
- Redis: 6379

**Production:**
- HTTP: 80 (nginx)
- HTTPS: 443 (nginx)
- Внутренняя сеть Docker для остальных сервисов

## Безопасность

1. **Всегда используйте сильные пароли**
2. **Регулярно обновляйте зависимости**
3. **Настройте firewall:**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
4. **Регулярно делайте бэкапы БД**
5. **Мониторьте логи на подозрительную активность**

