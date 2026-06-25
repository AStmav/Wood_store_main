# Generated manually for django-simple-history

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('catalog', '0004_product_specifications'),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoricalProduct',
            fields=[
                ('id', models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('uuid', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, verbose_name='UUID')),
                ('created_at', models.DateTimeField(blank=True, editable=False, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(blank=True, editable=False, verbose_name='Дата обновления')),
                ('name', models.CharField(max_length=200, verbose_name='Название товара')),
                ('description', models.TextField(blank=True, verbose_name='Описание товара')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Цена')),
                ('image', models.TextField(blank=True, max_length=100, null=True, verbose_name='Изображение')),
                ('rating', models.FloatField(default=0.0, verbose_name='Рейтинг')),
                ('slug', models.SlugField(max_length=200, verbose_name='Slug')),
                ('stock_quantity', models.PositiveIntegerField(default=0, verbose_name='Количество на складе')),
                ('is_available', models.BooleanField(default=True, verbose_name='Доступен для заказа')),
                ('specifications', models.JSONField(blank=True, default=dict, verbose_name='Характеристики')),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('category', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='catalog.category', verbose_name='Категория')),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'historical Товар',
                'verbose_name_plural': 'historical Товары',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
        ),
    ]
