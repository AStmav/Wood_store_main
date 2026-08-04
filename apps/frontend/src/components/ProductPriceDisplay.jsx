import DiscountBadge from './DiscountBadge.jsx';
import {
  formatPrice,
  hasProductDiscount,
  getProductDisplayPrice,
} from '../utils/format.js';

const sizeClasses = {
  sm: {
    current: 'text-base font-bold text-red-600',
    old: 'text-xs text-gray-400 line-through',
    request: 'text-base font-semibold text-gray-900',
    regular: 'text-base font-bold text-gray-900',
  },
  md: {
    current: 'text-lg sm:text-xl font-bold text-red-600',
    old: 'text-sm text-gray-400 line-through',
    request: 'text-lg sm:text-xl font-semibold text-gray-900',
    regular: 'text-lg sm:text-xl font-bold text-gray-900',
  },
  lg: {
    current: 'text-2xl sm:text-3xl font-bold text-red-600',
    old: 'text-base text-gray-400 line-through',
    request: 'text-2xl sm:text-3xl font-semibold text-gray-900',
    regular: 'text-2xl sm:text-3xl font-bold text-gray-900',
  },
};

export default function ProductPriceDisplay({ product, size = 'md', className = '' }) {
  const styles = sizeClasses[size] || sizeClasses.md;

  if (product?.price_on_request) {
    return (
      <div className={className}>
        <span className={styles.request}>Цена по запросу</span>
      </div>
    );
  }

  if (hasProductDiscount(product)) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className={styles.current}>
          {formatPrice(getProductDisplayPrice(product))} ₽
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={styles.old}>
            {formatPrice(product.price)} ₽
          </span>
          <DiscountBadge percent={product.discount_percent} variant="inline" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className={styles.regular}>
        {formatPrice(product?.price)} ₽
      </span>
    </div>
  );
}

export function ProductPhotoDiscountBadge({ product }) {
  if (!hasProductDiscount(product)) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 z-10">
      <DiscountBadge percent={product.discount_percent} variant="photo" />
    </div>
  );
}
