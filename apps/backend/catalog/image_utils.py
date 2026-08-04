"""Генерация компактных превью для карточек каталога."""

from __future__ import annotations

import io
import os
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

# Ширина карточки на retina (~400 CSS px * 2)
CARD_MAX_SIDE = 800
CARD_JPEG_QUALITY = 72
CARD_WEBP_QUALITY = 70


def build_card_image_content(source_file) -> ContentFile | None:
    """Сжать/уменьшить изображение для сетки каталога. Возвращает ContentFile или None."""
    if not source_file:
        return None

    try:
        source_file.open('rb')
    except Exception:
        pass

    try:
        with Image.open(source_file) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
            elif img.mode == 'L':
                img = img.convert('RGB')

            img.thumbnail((CARD_MAX_SIDE, CARD_MAX_SIDE), Image.Resampling.LANCZOS)

            buffer = io.BytesIO()
            # WebP обычно меньше JPEG при том же качестве
            img.save(buffer, format='WEBP', quality=CARD_WEBP_QUALITY, method=6)
            buffer.seek(0)

            base = Path(getattr(source_file, 'name', 'product') or 'product').stem
            filename = f'{base}_card.webp'
            return ContentFile(buffer.read(), name=filename)
    except Exception:
        return None
    finally:
        try:
            source_file.close()
        except Exception:
            pass


def card_upload_to(instance, filename: str) -> str:
    name = os.path.basename(filename)
    return f'products/cards/{name}'
