from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0006_delete_historicalproduct'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={
                'ordering': ['sort_order', 'name'],
                'verbose_name': 'Категория',
                'verbose_name_plural': 'Категории',
            },
        ),
        migrations.AddField(
            model_name='category',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='Активна'),
        ),
        migrations.AddField(
            model_name='category',
            name='parent',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='children',
                to='catalog.category',
                verbose_name='Родительская категория',
            ),
        ),
        migrations.AddField(
            model_name='category',
            name='sort_order',
            field=models.PositiveIntegerField(default=0, verbose_name='Порядок сортировки'),
        ),
        migrations.AddField(
            model_name='category',
            name='image',
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to='categories/',
                verbose_name='Изображение',
            ),
        ),
    ]
