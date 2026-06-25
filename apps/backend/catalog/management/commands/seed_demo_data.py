import io
import random
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify


def make_slug(value: str, prefix: str = 'item') -> str:
    slug = slugify(value, allow_unicode=True)
    return slug or f'{prefix}-{abs(hash(value)) % 10_000_000}'
from PIL import Image, ImageDraw, ImageFont

from about.models import About
from catalog.models import Category, Product
from news.models import News
from orders.models import Delivery, Order, OrderItem, Payment
from orders.services import OrderService
from users.models import User

CATEGORIES = [
    ('Диваны и кресла', 'Мягкая мебель для гостиной и отдыха.'),
    ('Столы и стулья', 'Обеденные и письменные комплекты из натурального дерева.'),
    ('Шкафы и комоды', 'Системы хранения для спальни и гостиной.'),
    ('Кровати и матрасы', 'Спальные гарнитуры и ортопедические матрасы.'),
    ('Детская мебель', 'Безопасная мебель для детской комнаты.'),
    ('Кухни', 'Кухонные гарнитуры и обеденные зоны.'),
    ('Прихожие', 'Мебель для прихожей и коридора.'),
    ('Офисная мебель', 'Столы, кресла и стеллажи для работы.'),
]

MATERIALS = ['Дуб', 'Сосна', 'Бук', 'Ясень', 'Орех', 'Берёза', 'МДФ', 'Массив дерева']
COLORS = ['Натуральный', 'Венге', 'Белый', 'Серый', 'Орех', 'Дуб молочный', 'Графит']
WOOD_PRODUCTS = {
    'Диваны и кресла': ['Диван', 'Кресло', 'Угловой диван', 'Пуф', 'Модульный диван'],
    'Столы и стулья': ['Обеденный стол', 'Письменный стол', 'Стул', 'Табурет', 'Журнальный столик'],
    'Шкафы и комоды': ['Шкаф-купе', 'Комод', 'Тумба', 'Стеллаж', 'Витрина'],
    'Кровати и матрасы': ['Кровать двуспальная', 'Кровать односпальная', 'Матрас', 'Изголовье', 'Тумба прикроватная'],
    'Детская мебель': ['Кроватка', 'Письменный стол', 'Шкаф', 'Комод', 'Стеллаж'],
    'Кухни': ['Кухонный гарнитур', 'Обеденный стол', 'Барная стойка', 'Кухонный стул', 'Витрина'],
    'Прихожие': ['Прихожая', 'Обувница', 'Вешалка', 'Зеркало', 'Банкетка'],
    'Офисная мебель': ['Офисный стол', 'Офисное кресло', 'Шкаф для документов', 'Тумба', 'Стеллаж'],
}

NEWS_ITEMS = [
    (
        'Открытие нового салона в Якутске',
        'Мы рады сообщить об открытии шоурума «Сказкин Дом» с экспозицией из более чем 200 моделей мебели.',
    ),
    (
        'Скидки на кухонные гарнитуры',
        'До конца месяца действует скидка 15% на весь ассортимент кухонь при заказе с доставкой.',
    ),
    (
        'Новая коллекция детской мебели',
        'Представляем экологичную коллекцию из массива сосны с безопасными покрытиями.',
    ),
    (
        'Бесплатная сборка при заказе от 50 000 ₽',
        'При оформлении заказа на сумму от 50 000 рублей сборка мебели — бесплатно.',
    ),
    (
        'Расширен ассортимент матрасов',
        'В каталоге появились ортопедические матрасы с независимым пружинным блоком.',
    ),
]

ADDRESSES = [
    'г. Якутск, ул. Ленина, д. 12, кв. 45',
    'г. Якутск, ул. Кирова, д. 28',
    'г. Якутск, мкр. Марха, д. 5, кв. 18',
    'г. Якутск, пр. Ленина, д. 4, офис 201',
    'г. Якутск, ул. Петра Алексеева, д. 33',
]

PLACEHOLDER_COLORS = [
    (139, 90, 43),
    (160, 120, 80),
    (101, 67, 33),
    (180, 150, 110),
    (120, 100, 80),
    (200, 180, 150),
]


def make_product_image(product_name: str) -> ContentFile:
    color = random.choice(PLACEHOLDER_COLORS)
    image = Image.new('RGB', (800, 600), color)
    draw = ImageDraw.Draw(image)
    draw.rectangle([(40, 40), (760, 560)], outline=(255, 255, 255), width=3)
    text = product_name[:28] + ('…' if len(product_name) > 28 else '')
    draw.text((60, 280), text, fill=(255, 255, 255))
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    filename = f'{make_slug(product_name, "product")}.jpg'
    return ContentFile(buffer.read(), name=filename)


class Command(BaseCommand):
    help = 'Заполняет БД демо-данными для тестирования магазина'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Удалить существующие демо-данные перед заполнением',
        )
        parser.add_argument(
            '--products',
            type=int,
            default=48,
            help='Количество товаров (по умолчанию: 48)',
        )
        parser.add_argument(
            '--orders',
            type=int,
            default=12,
            help='Количество тестовых заказов (по умолчанию: 12)',
        )
        parser.add_argument(
            '--no-images',
            action='store_true',
            help='Не генерировать изображения товаров',
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            if options['clear']:
                self._clear_data()

            categories = self._create_categories()
            products = self._create_products(
                categories,
                count=options['products'],
                with_images=not options['no_images'],
            )
            self._create_news()
            self._create_about()
            users = self._create_users()
            orders_count = self._create_orders(
                products,
                users,
                count=options['orders'],
            )

        self.stdout.write(self.style.SUCCESS(
            f'Готово: {len(categories)} категорий, {len(products)} товаров, '
            f'{News.objects.count()} новостей, {orders_count} заказов.'
        ))

    def _clear_data(self):
        self.stdout.write('Очистка данных…')
        OrderItem.objects.all().delete()
        Payment.objects.all().delete()
        Delivery.objects.all().delete()
        Order.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        News.objects.all().delete()
        About.objects.all().delete()
        User.objects.filter(email__endswith='@demo.skazkindom.local').delete()

    def _create_categories(self):
        categories = []
        for name, description in CATEGORIES:
            category, _ = Category.objects.get_or_create(
                name=name,
                defaults={'description': description, 'slug': make_slug(name, 'category')},
            )
            categories.append(category)
        return categories

    def _create_products(self, categories, count, with_images):
        products = []
        used_names = set(Product.objects.values_list('name', flat=True))

        while len(products) < count:
            category = random.choice(categories)
            base_name = random.choice(WOOD_PRODUCTS[category.name])
            material = random.choice(MATERIALS)
            color = random.choice(COLORS)
            name = f'{base_name} «{material}» {color}'
            suffix = random.randint(100, 999)
            full_name = f'{name} {suffix}'

            if full_name in used_names:
                continue
            used_names.add(full_name)

            width = random.randint(60, 240)
            depth = random.randint(40, 90)
            height = random.randint(45, 220)
            price = Decimal(random.randint(3500, 185000))
            stock = random.randint(0, 40)
            rating = round(random.uniform(3.5, 5.0), 1)

            product = Product(
                name=full_name,
                description=(
                    f'Стильная модель из коллекции «{category.name}». '
                    f'Материал: {material}. Цвет: {color}. '
                    f'Подходит для современного интерьера.'
                ),
                price=price,
                category=category,
                rating=rating,
                stock_quantity=stock,
                is_available=stock > 0,
                specifications={
                    'Материал': material,
                    'Цвет': color,
                    'Размеры': f'{width}x{depth}x{height} см',
                    'Страна': 'Россия',
                    'Гарантия': f'{random.choice([12, 24, 36])} мес.',
                },
            )
            if with_images:
                product.image = make_product_image(full_name)
            product.save()
            products.append(product)

        return products

    def _create_news(self):
        for index, (title, content) in enumerate(NEWS_ITEMS, start=1):
            slug = make_slug(title, f'news-{index}')
            News.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': title,
                    'content': content,
                    'excerpt': content[:180],
                    'is_active': True,
                },
            )

    def _create_about(self):
        About.objects.get_or_create(
            title='О магазине «Сказкин Дом»',
            defaults={
                'content': (
                    '«Сказкин Дом» — интернет-магазин мебели в Якутске. '
                    'Мы предлагаем качественную мебель из натуральных материалов, '
                    'доставку по городу и сборку. Работаем с 2018 года.'
                ),
                'is_active': True,
            },
        )

    def _create_users(self):
        users = []
        demo_users = [
            ('demo@skazkindom.local', 'Демо', 'Покупатель'),
            ('test@skazkindom.local', 'Тест', 'Клиент'),
        ]
        for email, first_name, last_name in demo_users:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': f'+7914{random.randint(1000000, 9999999)}',
                    'is_active': True,
                },
            )
            if created:
                user.set_password('demo12345')
                user.save()
            users.append(user)
        return users

    def _create_orders(self, products, users, count):
        if not products:
            return 0

        statuses = ['new', 'processing', 'shipped', 'delivered', 'cancelled']
        delivery_types = ['standard', 'pickup']
        payment_methods = ['card', 'cash', 'bank_transfer']
        payment_statuses = ['pending', 'processing', 'completed', 'failed']

        created = 0
        for i in range(count):
            user = random.choice(users) if random.random() > 0.3 else None
            order_products = random.sample(products, k=random.randint(1, min(4, len(products))))

            order = Order.objects.create(
                user=user,
                order_number=OrderService.generate_order_number(),
                status=random.choice(statuses),
                phone=f'+7914{random.randint(1000000, 9999999)}',
                email=user.email if user else f'guest{i}@example.com',
                address=random.choice(ADDRESSES),
                comment=random.choice(['', '', 'Позвонить за час', 'Домофон не работает']),
                telegram_notification_sent=random.choice([True, False]),
            )

            total = Decimal('0')
            for product in order_products:
                quantity = random.randint(1, 3)
                item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=product.price,
                )
                total += item.total_price

            order.total_amount = total
            order.save(update_fields=['total_amount'])

            delivery_type = random.choice(delivery_types)
            delivery_cost = OrderService.calculate_delivery_cost(delivery_type)
            Delivery.objects.create(
                order=order,
                delivery_type=delivery_type,
                delivery_cost=delivery_cost,
            )
            Payment.objects.create(
                order=order,
                amount=total + delivery_cost,
                status=random.choice(payment_statuses),
                payment_method=random.choice(payment_methods),
                paid_at=timezone.now() if random.random() > 0.4 else None,
            )
            created += 1

        return created
