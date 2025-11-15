FROM python:3.11-slim

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Добавляем gunicorn для production
RUN pip install --no-cache-dir gunicorn

# Копируем код приложения
COPY . .

# Создаем директории для статики и медиа
RUN mkdir -p staticfiles media

# Собираем статические файлы (будет выполнено при запуске если нужно)
# RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Команда запуска (будет переопределена в docker-compose)
CMD ["sh", "-c", "python manage.py migrate && gunicorn furniture_store.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120"]
