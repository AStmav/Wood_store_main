import {
  AVAILABILITY_STYLES,
  getAvailabilityLabel,
  getProductAvailabilityStatus,
} from '../utils/productAvailability.js';

export default function ProductAvailabilityBadge({ product, className = '' }) {
  const status = getProductAvailabilityStatus(product);
  const label = getAvailabilityLabel(product);
  const styles = AVAILABILITY_STYLES[status] || AVAILABILITY_STYLES.in_stock;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles} ${className}`}
    >
      {label}
    </span>
  );
}
