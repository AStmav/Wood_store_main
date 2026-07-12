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

export const hasProductDiscount = (product) =>
  Boolean(product?.has_discount && product?.sale_price != null && !product?.price_on_request);

export const getProductDisplayPrice = (product) => {
  if (product?.price_on_request) {
    return null;
  }
  if (hasProductDiscount(product)) {
    return product.sale_price;
  }
  return product?.price ?? null;
};

export const formatProductPrice = (product) => {
  if (product?.price_on_request) {
    return 'Цена по запросу';
  }
  if (hasProductDiscount(product)) {
    return `${formatPrice(product.sale_price)} ₽`;
  }
  return `от ${formatPrice(product?.price)} ₽`;
};

export const formatProductPriceWithOld = (product) => {
  if (product?.price_on_request) {
    return { primary: 'Цена по запросу', secondary: null, discountPercent: 0 };
  }
  if (hasProductDiscount(product)) {
    return {
      primary: `${formatPrice(product.sale_price)} ₽`,
      secondary: `${formatPrice(product.price)} ₽`,
      discountPercent: product.discount_percent,
    };
  }
  return {
    primary: `от ${formatPrice(product?.price)} ₽`,
    secondary: null,
    discountPercent: 0,
  };
};
