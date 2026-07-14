import django.db.models.deletion
from django.db import migrations, models


def backfill_product_images(apps, schema_editor):
    Product = apps.get_model('catalog', 'Product')
    ProductImage = apps.get_model('catalog', 'ProductImage')
    for product in Product.objects.exclude(image='').exclude(image=None):
        if product.images.exists():
            continue
        ProductImage.objects.create(
            product=product,
            image=product.image,
            sort_order=0,
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0010_product_discount_percent'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='products/', verbose_name='Изображение')),
                ('sort_order', models.PositiveSmallIntegerField(
                    default=0,
                    help_text='Меньше число — раньше в галерее. Первое также показывается в каталоге.',
                    verbose_name='Порядок',
                )),
                ('product', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='images',
                    to='catalog.product',
                    verbose_name='Товар',
                )),
            ],
            options={
                'verbose_name': 'Изображение товара',
                'verbose_name_plural': 'Изображения товара',
                'ordering': ['sort_order', 'id'],
            },
        ),
        migrations.RunPython(backfill_product_images, noop_reverse),
    ]
