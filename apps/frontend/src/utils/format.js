export const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(numberValue);
};

export const formatProductPrice = (product) => {
  if (product?.price_on_request) {
    return 'Цена по запросу';
  }
  return `от ${formatPrice(product.price)} ₽`;
};
