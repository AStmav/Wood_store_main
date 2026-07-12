from decimal import Decimal, ROUND_HALF_UP

DISCOUNT_STEP = 5
DISCOUNT_MIN = 5
DISCOUNT_MAX = 95

DISCOUNT_PERCENT_CHOICES = [(0, 'Без скидки')] + [
    (value, f'{value}%') for value in range(DISCOUNT_MIN, DISCOUNT_MAX + 1, DISCOUNT_STEP)
]

VALID_DISCOUNT_PERCENTS = {choice[0] for choice in DISCOUNT_PERCENT_CHOICES}


def calculate_sale_price(price, discount_percent):
    if not discount_percent:
        return None
    multiplier = Decimal(1) - Decimal(discount_percent) / Decimal(100)
    return (price * multiplier).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
