from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('about', '0002_alter_about_content'),
    ]

    operations = [
        migrations.AlterField(
            model_name='about',
            name='content',
            field=models.TextField(
                help_text='Основной текст раздела "О нас"',
                verbose_name='Содержание',
            ),
        ),
    ]
