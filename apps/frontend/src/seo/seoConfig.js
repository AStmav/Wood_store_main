const SITE_NAME = 'Сказкин Дом';
const DEFAULT_DESCRIPTION =
  'Сказкин Дом — детская мебель и игрушки в Якутске. Кровати, матрасы, столы и стулья с доставкой и сборкой.';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return Boolean(value && UUID_RE.test(String(value)));
}

export function getSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return 'https://skazkindomykt.ru';
}

export function absoluteUrl(path = '/') {
  const base = getSiteUrl();
  if (!path) return `${base}/`;
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function productPath(product) {
  const key = product?.slug || product?.uuid;
  return key ? `/product/${key}` : '/';
}

export function categoryPath(category) {
  const key = category?.slug || category?.uuid;
  return key ? `/catalog/${key}` : '/';
}

export function buildProductJsonLd(product) {
  if (!product) return null;
  const url = absoluteUrl(productPath(product));
  const images = [];
  if (Array.isArray(product.images)) {
    product.images.forEach((item) => {
      if (item?.image) images.push(absoluteUrl(item.image));
    });
  }
  if (!images.length && product.image) {
    images.push(absoluteUrl(product.image));
  }

  const offer = {
    '@type': 'Offer',
    url,
    availability: 'https://schema.org/InStock',
    priceCurrency: 'RUB',
  };
  if (product.price_on_request) {
    offer.price = '0';
    offer.description = 'Цена по запросу';
  } else {
    offer.price = String(
      product.has_discount && product.sale_price != null
        ? product.sale_price
        : product.price,
    );
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — ${SITE_NAME}`,
    sku: product.uuid,
    image: images.length ? images : [absoluteUrl('/logo.png')],
    offers: offer,
    ...(product.category?.name ? { category: product.category.name } : {}),
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: SITE_NAME,
    url: getSiteUrl(),
    telephone: '+7-914-102-32-32',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Якутск',
      addressCountry: 'RU',
    },
    image: absoluteUrl('/logo.png'),
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export { SITE_NAME, DEFAULT_DESCRIPTION };
