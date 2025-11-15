from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('catalog', '0004_product_specifications'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteVisit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name='UUID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('path', models.CharField(max_length=255, verbose_name='Путь')),
                ('session_id', models.CharField(blank=True, max_length=100, verbose_name='ID сессии')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True, verbose_name='IP адрес')),
                ('user_agent', models.TextField(blank=True, verbose_name='User-Agent')),
                ('referrer', models.CharField(blank=True, max_length=255, verbose_name='Источник перехода')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Посещение сайта',
                'verbose_name_plural': 'Посещения сайта',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProductView',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name='UUID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('session_id', models.CharField(blank=True, max_length=100, verbose_name='ID сессии')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True, verbose_name='IP адрес')),
                ('user_agent', models.TextField(blank=True, verbose_name='User-Agent')),
                ('path', models.CharField(blank=True, max_length=255, verbose_name='Путь')),
                ('referrer', models.CharField(blank=True, max_length=255, verbose_name='Источник перехода')),
                ('product', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='views', to='catalog.product', verbose_name='Товар')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Просмотр товара',
                'verbose_name_plural': 'Просмотры товаров',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='productview',
            index=models.Index(fields=['product', 'created_at'], name='analytics_p_product_9e5e76_idx'),
        ),
        migrations.AddIndex(
            model_name='productview',
            index=models.Index(fields=['session_id', 'created_at'], name='analytics_p_session_07720e_idx'),
        ),
        migrations.AddIndex(
            model_name='sitevisit',
            index=models.Index(fields=['created_at'], name='analytics_s_created_04f2f5_idx'),
        ),
        migrations.AddIndex(
            model_name='sitevisit',
            index=models.Index(fields=['session_id', 'created_at'], name='analytics_s_session_934c24_idx'),
        ),
    ]


