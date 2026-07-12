export default function DiscountBadge({ percent, variant = 'inline', className = '' }) {
  if (!percent || percent <= 0) {
    return null;
  }

  const baseClasses = 'inline-flex items-center justify-center font-bold leading-none';
  const variantClasses = {
    inline: 'px-2 py-0.5 rounded-md text-xs bg-amber-400 text-gray-900',
    photo: 'px-2.5 py-1 rounded-md text-sm bg-red-600 text-white shadow-md',
    large: 'px-3 py-1 rounded-lg text-sm bg-amber-400 text-gray-900',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.inline} ${className}`}>
      −{percent}%
    </span>
  );
}
