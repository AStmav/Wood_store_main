import { useEffect, useRef } from 'react';
import ProductCard from './ProductCard.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Сетка товаров с подгрузкой при скролле (IntersectionObserver)
 * + кнопка «Показать ещё» (Baymard: hybrid для категорий).
 */
export default function ProductInfiniteGrid({
  products,
  count,
  hasMore,
  loadingMore,
  onLoadMore,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '280px 0px',
        threshold: 0,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, products.length]);

  if (!products.length) {
    return null;
  }

  return (
    <div>
      <p className="mb-4 text-center text-sm text-gray-500" aria-live="polite">
        Показано {products.length}
        {count > 0 ? ` из ${count}` : ''}
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        {products.map((product) => (
          <div
            key={product.uuid}
            className="w-full max-w-sm sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-6" aria-hidden="true" />

      <div className="mt-4 flex flex-col items-center gap-3 pb-4">
        {loadingMore && (
          <div className="py-2" aria-busy="true">
            <LoadingSpinner />
          </div>
        )}

        {hasMore && !loadingMore && (
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:border-blue-400 hover:bg-blue-50"
          >
            Показать ещё
          </button>
        )}

        {!hasMore && products.length > 0 && count > 10 && (
          <p className="text-sm text-gray-400">Все товары загружены</p>
        )}
      </div>
    </div>
  );
}
