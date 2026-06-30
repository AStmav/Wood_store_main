import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CategoryDropdown = ({ categories, onCategorySelect, isVisible, onMouseEnter, onMouseLeave }) => {
  const [hoveredRoot, setHoveredRoot] = useState(null);

  if (!isVisible) return null;

  const activeRoot = categories.find((c) => c.uuid === hoveredRoot) || categories[0];

  return (
    <div
      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white mx-auto" />

      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[420px]">
        <div className="flex">
          <div className="w-52 border-r border-gray-100 py-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category.uuid}
                  type="button"
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    activeRoot?.uuid === category.uuid
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredRoot(category.uuid)}
                  onClick={() => onCategorySelect(category.uuid)}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">Категории не найдены</div>
            )}
          </div>

          <div className="flex-1 py-2 min-w-[220px]">
            {activeRoot ? (
              <>
                <Link
                  to={`/catalog/${activeRoot.uuid}`}
                  className="block px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  onClick={() => onCategorySelect(activeRoot.uuid)}
                >
                  Все: {activeRoot.name}
                </Link>
                {activeRoot.children?.length > 0 ? (
                  activeRoot.children.map((child) => (
                    <Link
                      key={child.uuid}
                      to={`/catalog/${child.uuid}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => onCategorySelect(child.uuid)}
                    >
                      {child.name}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-400">Нет подкатегорий</p>
                )}
              </>
            ) : null}
          </div>
        </div>

        <div className="border-t border-gray-100">
          <button
            type="button"
            className="w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50 text-sm font-medium"
            onClick={() => onCategorySelect('')}
          >
            Весь каталог
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDropdown;
