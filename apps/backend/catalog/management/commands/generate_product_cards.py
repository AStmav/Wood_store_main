from django.core.management.base import BaseCommand

from catalog.models import Product


class Command(BaseCommand):
    help = 'Сгенерировать image_card (WebP ~800px) для товаров каталога'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Пересоздать превью даже если image_card уже есть',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='Обработать не больше N товаров (0 = все)',
        )

    def handle(self, *args, **options):
        force = options['force']
        limit = options['limit']

        qs = (
            Product.objects
            .exclude(image='')
            .exclude(image__isnull=True)
            .order_by('id')
        )
        if limit:
            qs = qs[:limit]

        done = 0
        skipped = 0
        errors = 0

        for product in qs.iterator():
            try:
                changed = product.refresh_image_card(force=force)
                if changed:
                    card_name = product.image_card.name if product.image_card else None
                    Product.objects.filter(pk=product.pk).update(image_card=card_name)
                    done += 1
                    self.stdout.write(f'OK {product.pk} {product.name[:50]}')
                else:
                    skipped += 1
            except Exception as exc:
                errors += 1
                self.stderr.write(f'ERR {product.pk}: {exc}')

        self.stdout.write(self.style.SUCCESS(
            f'Done: created/updated={done}, skipped={skipped}, errors={errors}'
        ))
