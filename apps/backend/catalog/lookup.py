"""Общий lookup товара/категории по slug или UUID."""

from __future__ import annotations

import uuid as uuid_lib

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound


def resolve_by_slug_or_uuid(queryset, lookup: str):
    if not lookup:
        raise NotFound()
    try:
        uuid_lib.UUID(str(lookup))
        return get_object_or_404(queryset, uuid=lookup)
    except (ValueError, TypeError, AttributeError):
        return get_object_or_404(queryset, slug=lookup)
