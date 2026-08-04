import { useEffect, useCallback, useRef } from 'react';

/**
 * Полноэкранный просмотр фото товара (lightbox).
 * images: [{ id, url, alt }]
 */
export default function ImageLightbox({
  images = [],
  index = 0,
  onClose,
  onIndexChange,
}) {
  const total = images.length;
  const safeIndex = total > 0 ? Math.min(Math.max(index, 0), total - 1) : 0;
  const current = images[safeIndex];
  const hasMultiple = total > 1;
  const touchStartRef = useRef(null);

  const goPrev = useCallback(() => {
    if (!hasMultiple || !onIndexChange) return;
    onIndexChange(safeIndex === 0 ? total - 1 : safeIndex - 1);
  }, [hasMultiple, onIndexChange, safeIndex, total]);

  const goNext = useCallback(() => {
    if (!hasMultiple || !onIndexChange) return;
    onIndexChange(safeIndex === total - 1 ? 0 : safeIndex + 1);
  }, [hasMultiple, onIndexChange, safeIndex, total]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    };

    // iOS: overflow:hidden alone often still scrolls the page under the overlay
    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      } else if (event.key === 'ArrowLeft') {
        goPrev();
      } else if (event.key === 'ArrowRight') {
        goNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, goPrev, goNext]);

  const onTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches?.[0];
    touchStartRef.current = null;
    if (!start || !touch || !hasMultiple) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  if (!current) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-3 sm:p-6 overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-label="Увеличенное изображение товара"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        aria-label="Закрыть"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 sm:left-4 z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Предыдущее фото"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 sm:right-4 z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Следующее фото"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative flex max-h-full max-w-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={current.id}
          src={current.url}
          alt={current.alt}
          draggable={false}
          className="max-h-[min(85vh,900px)] max-w-[min(96vw,1100px)] object-contain select-none"
          onError={(e) => {
            e.target.src = '/placeholder-product.svg';
          }}
        />
        {hasMultiple && (
          <div className="mt-3 rounded-md bg-black/55 px-3 py-1 text-sm font-medium text-white">
            {safeIndex + 1}/{total}
          </div>
        )}
      </div>
    </div>
  );
}
