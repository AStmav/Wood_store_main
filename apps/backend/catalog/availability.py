"""Статусы наличия товара для витрины."""

from django.db import models


class AvailabilityStatus(models.TextChoices):
    IN_STOCK = 'in_stock', 'В наличии'
    IN_TRANSIT = 'in_transit', 'В пути'


def is_orderable_status(status: str) -> bool:
    return status == AvailabilityStatus.IN_STOCK
