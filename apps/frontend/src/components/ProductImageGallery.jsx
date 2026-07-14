import React, { useEffect, useRef, useState } from 'react';
import { getMediaUrl } from '../config/api.js';
import { ProductPhotoDiscountBadge } from './ProductPriceDisplay.jsx';

/**
 * Build ordered gallery slides from API product payload.
 * Prefers `images[]`; falls back to legacy `image`.
 */
export function resolveProductGalleryImages(product) {
  const name = product?.name || 'Товар';
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return [...product.images]
      .filter((item) => item?.image)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .slice(0, 5)
      .map((item, index) => ({
        id: item.id ?? index,
        url: getMediaUrl(item.image),
        alt: `${name}, фото ${index + 1}`,
      }));
  }
  if (product?.image) {
    return [{ id: 'legacy', url: getMediaUrl(product.image), alt: name }];
  }
  return [{ id: 'placeholder', url: '/placeholder-product.svg', alt: name }];
}

const ProductImageGallery = ({ product }) => {
  const slides = resolveProductGalleryImages(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef(null);
  const hasMultiple = slides.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.uuid]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !hasMultiple) return undefined;

    const onScroll = () => {
      const width = scroller.clientWidth || 1;
      const next = Math.round(scroller.scrollLeft / width);
      setActiveIndex(Math.min(Math.max(next, 0), slides.length - 1));
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [hasMultiple, slides.length]);

  const goTo = (index) => {
    const next = Math.min(Math.max(index, 0), slides.length - 1);
    setActiveIndex(next);
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollTo({ left: next * scroller.clientWidth, behavior: 'smooth' });
    }
  };

  const active = slides[activeIndex] || slides[0];

  return (
    <div className="space-y-3">
      {/* Desktop: main image */}
      <div className="relative hidden sm:block aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          key={active.id}
          src={active.url}
          alt={active.alt}
          className="w-full h-full object-cover"
          fetchPriority="high"
          onError={(e) => {
            e.target.src = '/placeholder-product.svg';
          }}
        />
        <ProductPhotoDiscountBadge product={product} />
        {hasMultiple && (
          <div className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
            {activeIndex + 1}/{slides.length}
          </div>
        )}
      </div>

      {/* Mobile: swipe carousel */}
      <div className="relative sm:hidden">
        <div
          ref={scrollerRef}
          className="flex aspect-square overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-lg bg-gray-100 scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          aria-label="Галерея изображений товара"
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative w-full h-full flex-shrink-0 snap-center">
              <img
                src={slide.url}
                alt={slide.alt}
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                }}
              />
            </div>
          ))}
        </div>
        <ProductPhotoDiscountBadge product={product} />
        {hasMultiple && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
            {activeIndex + 1}/{slides.length}
          </div>
        )}
      </div>

      {hasMultiple && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Миниатюры изображений"
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={slide.alt}
                onClick={() => goTo(index)}
                className={[
                  'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                  isActive ? 'border-blue-600' : 'border-transparent hover:border-gray-300',
                ].join(' ')}
              >
                <img
                  src={slide.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
