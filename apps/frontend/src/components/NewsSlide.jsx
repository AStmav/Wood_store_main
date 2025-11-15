import React from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../config/api';

const NewsSlide = ({ news, isActive = true }) => {
  return (
    <div className={`
      transition-all duration-500 ease-in-out
      ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `} style={{ pointerEvents: isActive ? 'auto' : 'none' }}>
      <Link 
        to={`/news/${news.slug}`} 
        className="block bg-white rounded-lg shadow-lg overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Изображение - фиксированный размер */}
        <div className="h-40 md:h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {news.image ? (
            <img 
              src={getMediaUrl(news.image)}
              alt={news.title}
              className="max-h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Контент */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {news.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {news.excerpt || news.content.substring(0, 120) + '...'}
          </p>
          
          {/* Только дата */}
          <div className="flex items-center justify-end">
            <span className="text-xs text-gray-500">
              {new Date(news.published_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NewsSlide; 