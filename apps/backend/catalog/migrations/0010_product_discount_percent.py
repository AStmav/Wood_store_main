from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0009_remove_rating_and_stock'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='discount_percent',
            field=models.PositiveSmallIntegerField(
                choices=[
                    (0, 'Без скидки'),
                    (5, '5%'),
                    (10, '10%'),
                    (15, '15%'),
                    (20, '20%'),
                    (25, '25%'),
                    (30, '30%'),
                    (35, '35%'),
                    (40, '40%'),
                    (45, '45%'),
                    (50, '50%'),
                    (55, '55%'),
                    (60, '60%'),
                    (65, '65%'),
                    (70, '70%'),
                    (75, '75%'),
                    (80, '80%'),
                    (85, '85%'),
                    (90, '90%'),
                    (95, '95%'),
                ],
                default=0,
                help_text='Процент скидки от базовой цены. Шаг 5% (5, 10, 15 … 95). 0 — без скидки.',
                verbose_name='Скидка',
            ),
        ),
    ]
