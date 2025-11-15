# Wood Project - Интернет-магазин мебели "Сказкин Дом"

Полнофункциональный интернет-магазин мебели с Django REST Framework бекендом и React фронтендом.

## 🚀 Быстрый старт

### Для разработки

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd Wood_project
```

2. **Скопируйте файлы переменных окружения:**
```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

3. **Отредактируйте `.env` файлы** (настройте пароли и ключи)

4. **Запустите проект:**
```bash
docker-compose up -d
```

5. **Создайте суперпользователя:**
```bash
docker-compose exec backend python manage.py createsuperuser
```

6. **Откройте в браузере:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin: http://localhost:8000/admin

### Для production

См. подробную инструкцию в [DEPLOYMENT.md](./DEPLOYMENT.md)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Структура проекта

```
Wood_project/
├── apps/
│   ├── backend/          # Django REST Framework API
│   │   ├── catalog/      # Каталог товаров
│   │   ├── orders/       # Заказы и корзина
│   │   ├── users/        # Пользователи
│   │   ├── news/         # Новости
│   │   ├── analytics/    # Аналитика
│   │   ├── notifications/# Telegram уведомления
│   │   └── ...
│   └── frontend/         # React фронтенд
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── context/
│       │   └── api/
│       └── ...
├── nginx/                # Nginx конфигурация для production
├── docker-compose.yml    # Development конфигурация
├── docker-compose.prod.yml # Production конфигурация
└── DEPLOYMENT.md         # Инструкция по развертыванию
```

## 🛠 Технологии

**Backend:**
- Django 5.0.2
- Django REST Framework
- PostgreSQL
- Celery + Redis
- Gunicorn

**Frontend:**
- React 18.2
- Vite
- Tailwind CSS
- Axios

## 🔧 Основные функции

- ✅ Каталог товаров с категориями
- ✅ Корзина (для зарегистрированных и гостей)
- ✅ Оформление заказов (для зарегистрированных и гостей)
- ✅ Избранное
- ✅ Новости
- ✅ Аналитика (просмотры товаров, посещения)
- ✅ Telegram уведомления о заказах
- ✅ Адаптивный дизайн
- ✅ JWT аутентификация

## 📝 API Endpoints

- `/api/catalog/` - Каталог товаров и категорий
- `/api/orders/` - Заказы и корзина
- `/api/users/` - Пользователи
- `/api/` - Новости, "О нас"
- `/api/analytics/` - Аналитика
- `/api/token/` - JWT аутентификация
- `/swagger/` - Swagger документация
- `/admin/` - Django Admin

## 🐳 Docker

**Development:**
```bash
docker-compose up -d
```

**Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Документация

- [Инструкция по развертыванию](./DEPLOYMENT.md)
- API документация: http://localhost:8000/swagger/

## 🔒 Безопасность

1. Всегда используйте сильные пароли
2. Регулярно обновляйте зависимости
3. Настройте SSL/TLS для production
4. Регулярно делайте бэкапы БД

## 📧 Поддержка

Для вопросов и поддержки обращайтесь к разработчику.

