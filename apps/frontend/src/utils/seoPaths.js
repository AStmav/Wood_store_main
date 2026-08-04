/** Путь карточки товара: предпочитаем slug. */
export function productPath(product) {
  if (!product) return '/';
  const key = product.slug || product.uuid;
  return `/product/${key}`;
}

/** Путь категории. */
export function categoryPath(category) {
  if (!category) return '/';
  const key = category.slug || category.uuid;
  return `/catalog/${key}`;
}

export function isUuidParam(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value || ''),
  );
}
