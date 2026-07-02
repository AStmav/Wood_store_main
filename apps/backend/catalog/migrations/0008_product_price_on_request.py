from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0007_category_hierarchy'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='price_on_request',
            field=models.BooleanField(
                default=False,
                help_text='Если включено, на сайте вместо цены показывается «Цена по запросу»',
                verbose_name='Цена по запросу',
            ),
        ),
    ]
