from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_order_customer_name'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='order',
            options={'ordering': ['-created_at'], 'verbose_name': 'Заявка', 'verbose_name_plural': 'Заявки'},
        ),
        migrations.AlterField(
            model_name='order',
            name='comment',
            field=models.TextField(blank=True, verbose_name='Комментарий клиента'),
        ),
        migrations.AlterField(
            model_name='order',
            name='order_number',
            field=models.CharField(blank=True, max_length=20, verbose_name='Номер заявки'),
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('new', 'Новая заявка'),
                    ('processing', 'Менеджер в работе'),
                    ('shipped', 'Расчёт отправлен'),
                    ('delivered', 'Закрыта'),
                    ('cancelled', 'Отменена'),
                ],
                default='new',
                max_length=20,
                verbose_name='Статус',
            ),
        ),
        migrations.AlterField(
            model_name='order',
            name='total_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Ориентир по прайсу'),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='order',
            field=models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='items', to='orders.order', verbose_name='Заявка'),
        ),
    ]
