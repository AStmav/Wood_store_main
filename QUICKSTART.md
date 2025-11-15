# Быстрый старт Wood Project

## Для разработки

### 1. Клонируйте и настройте

```bash
# Клонируйте репозиторий (если еще не клонировали)
git clone <repository-url>
cd Wood_project

# Скопируйте примеры переменных окружения
cp env.example .env
cp apps/backend/env.example apps/backend/.env
```

### 2. Отредактируйте `.env` файлы

**`.env` (корневой):**
```env
POSTGRES_PASSWORD=your_password_here
VITE_API_URL=http://localhost:8000
```

**`apps/backend/.env`:**
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_CHANNEL_ID=your-channel-id
```

**Генерация SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Запустите проект

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 4. Создайте суперпользователя

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 5. Откройте в браузере

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin панель:** http://localhost:8000/admin
- **Swagger:** http://localhost:8000/swagger

## Для production

См. подробную инструкцию в [DEPLOYMENT.md](./DEPLOYMENT.md)

```bash
# Запуск production версии
docker-compose -f docker-compose.prod.yml up -d

# Миграции
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Статика
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## Полезные команды

```bash
# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Перезапуск сервиса
docker-compose restart backend

# Выполнение команд в контейнере
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Очистка (ОСТОРОЖНО: удалит все данные!)
docker-compose down -v
```

## Структура портов

- Frontend: `3000`
- Backend: `8000`
- PostgreSQL: `5432`
- Redis: `6379`

## Решение проблем

### Контейнер не запускается
```bash
docker-compose logs [service_name]
docker-compose restart [service_name]
```

### Проблемы с БД
```bash
docker-compose exec db psql -U postgres -d wood_shop
```

### Очистка и пересборка
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Следующие шаги

1. Настройте Telegram бота для уведомлений (опционально)
2. Добавьте товары через админ-панель
3. Создайте категории товаров
4. Добавьте новости

Подробная документация: [README.md](./README.md) и [DEPLOYMENT.md](./DEPLOYMENT.md)

