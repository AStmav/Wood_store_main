export const AVAILABILITY = {
  IN_STOCK: 'in_stock',
  IN_TRANSIT: 'in_transit',
};

export const AVAILABILITY_LABELS = {
  [AVAILABILITY.IN_STOCK]: 'В наличии',
  [AVAILABILITY.IN_TRANSIT]: 'В пути',
};

export const AVAILABILITY_STYLES = {
  [AVAILABILITY.IN_STOCK]: 'bg-green-50 text-green-800',
  [AVAILABILITY.IN_TRANSIT]: 'bg-amber-50 text-amber-800',
};

export function getProductAvailabilityStatus(product) {
  return product?.availability_status || AVAILABILITY.IN_STOCK;
}

export function isProductOrderable(product) {
  if (product?.is_orderable != null) {
    return Boolean(product.is_orderable);
  }
  return getProductAvailabilityStatus(product) === AVAILABILITY.IN_STOCK;
}

export function getAvailabilityLabel(product) {
  const status = getProductAvailabilityStatus(product);
  return AVAILABILITY_LABELS[status] || AVAILABILITY_LABELS[AVAILABILITY.IN_STOCK];
}

export function schemaAvailabilityUrl(product) {
  return getProductAvailabilityStatus(product) === AVAILABILITY.IN_TRANSIT
    ? 'https://schema.org/PreOrder'
    : 'https://schema.org/InStock';
}
