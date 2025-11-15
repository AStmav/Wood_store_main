import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewsSlide from './NewsSlide.jsx';

const NewsSlider = ({ news }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : false));
  const intervalRef = useRef(null);

  const slidesPerView = isDesktop && news.length >= 2 ? 2 : 1;
  const totalSlides = Math.ceil(news.length / slidesPerView);
  const showNavigation = totalSlides > 1;
  const enableAutoPlay = totalSlides > 1;

  const startAutoPlay = useCallback(() => {
    if (!enableAutoPlay || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }
    }, 6000);
  }, [isPaused, totalSlides, enableAutoPlay]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    if (enableAutoPlay) {
      stopAutoPlay();
      startAutoPlay();
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    if (enableAutoPlay) {
      stopAutoPlay();
      startAutoPlay();
    }
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
    if (enableAutoPlay) {
      stopAutoPlay();
      startAutoPlay();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (enableAutoPlay) {
      startAutoPlay();
      return () => stopAutoPlay();
    }
  }, [startAutoPlay, stopAutoPlay, enableAutoPlay]);

  useEffect(() => {
    setCurrentSlide((prev) => Math.min(prev, totalSlides - 1));
  }, [totalSlides]);

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden max-w-6xl w-full mx-auto"
      onMouseEnter={() => {
        setIsPaused(true);
        stopAutoPlay();
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        startAutoPlay();
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {Array.from({ length: totalSlides }, (_, slideIndex) => {
          const startIndex = slideIndex * slidesPerView;
          const slideNews = news.slice(startIndex, startIndex + slidesPerView);

          return (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className={`grid grid-cols-1 ${slidesPerView === 2 ? 'md:grid-cols-2' : ''} gap-6 px-4`}> 
                {slideNews.map((item) => (
                  <NewsSlide key={item.uuid} news={item} isActive={currentSlide === slideIndex} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showNavigation && (
        <>
          <button
            onClick={prevSlide}
            className="absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showNavigation && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-200
                ${currentSlide === index ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsSlider;

