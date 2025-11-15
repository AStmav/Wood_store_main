import React, { useState } from 'react';

const CategoryDropdown = ({ categories, onCategorySelect, isVisible, onMouseEnter, onMouseLeave }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Стрелка вверх */}
      <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white mx-auto"></div>
      
      {/* Меню категорий */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48">
        {categories.length > 0 ? (
          categories.map((category) => (
            <button
              key={category.uuid}
              className={`
                w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200
                ${hoveredCategory === category.uuid ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                first:rounded-t-lg last:rounded-b-lg
              `}
              onMouseEnter={() => setHoveredCategory(category.uuid)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => onCategorySelect(category.uuid)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <svg 
                  className="w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-gray-500 text-center">
            Категории не найдены
          </div>
        )}
        
        {/* Кнопка "Все категории" */}
        <div className="border-t border-gray-100 pt-2">
          <button
            className="w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-b-lg font-medium"
            onClick={() => onCategorySelect('')}
          >
            Все категории
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDropdown; 