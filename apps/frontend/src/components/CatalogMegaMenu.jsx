import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../config/api.js';
import { categoryPath } from '../seo/seoConfig.js';

export default function CatalogMegaMenu({
  categories,
  onCategorySelect,
  isVisible,
  onMouseEnter,
  onMouseLeave,
}) {
  const [hoveredRootId, setHoveredRootId] = useState(null);

  useEffect(() => {
    if (isVisible && categories.length > 0) {
      setHoveredRootId(categories[0].uuid);
    }
  }, [isVisible, categories]);

  if (!isVisible) return null;

  const activeRoot =
    categories.find((category) => category.uuid === hoveredRootId) || categories[0];

  const categoryImage = activeRoot?.image ? getMediaUrl(activeRoot.image) : null;

  return (
    <div
      className="absolute top-full left-0 right-0 md:right-auto mt-2 z-50 w-full md:w-[min(72rem,calc(100%-2rem))] max-w-[calc(100vw-2rem)]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,28%)_1fr] min-h-[300px]">
          <nav className="border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/80 py-3">
            <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Категории
            </p>
            {categories.length > 0 ? (
              <ul>
                {categories.map((category) => {
                  const isActive = activeRoot?.uuid === category.uuid;
                  return (
                    <li key={category.uuid}>
                      <button
                        type="button"
                        className={`w-full flex items-center justify-between px-5 py-3 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-white text-blue-700 font-semibold shadow-sm'
                            : 'text-gray-700 hover:bg-white/80 hover:text-blue-600'
                        }`}
                        onMouseEnter={() => setHoveredRootId(category.uuid)}
                        onFocus={() => setHoveredRootId(category.uuid)}
                        onClick={() => onCategorySelect(category)}
                      >
                        <span>{category.name}</span>
                        <svg
                          className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-300'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-3 text-sm text-gray-500">Категории не найдены</p>
            )}
          </nav>

          <div className="flex flex-col lg:flex-row min-h-[240px]">
            <div className="flex-1 p-6 lg:p-8">
              {activeRoot ? (
                <>
                  <Link
                    to={categoryPath(activeRoot)}
                    className="inline-flex items-center text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    onClick={() => onCategorySelect(activeRoot)}
                  >
                    {activeRoot.name}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {activeRoot.children?.length > 0 ? (
                    <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                      {activeRoot.children.map((child) => (
                        <li key={child.uuid}>
                          <Link
                            to={categoryPath(child)}
                            className="group flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                            onClick={() => onCategorySelect(child)}
                          >
                            <span className="mr-2 text-blue-400 group-hover:text-blue-600">•</span>
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                      {activeRoot.description || 'Смотрите все модели в этой категории.'}
                    </p>
                  )}

                  <Link
                    to={categoryPath(activeRoot)}
                    className="inline-block mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => onCategorySelect(activeRoot)}
                  >
                    Смотреть все: {activeRoot.name}
                  </Link>
                </>
              ) : null}
            </div>

            <div className="lg:w-56 xl:w-64 p-4 lg:p-5 lg:border-l border-t lg:border-t-0 border-gray-100 bg-gray-50/50">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100 shadow-inner">
                {categoryImage ? (
                  <img
                    src={categoryImage}
                    alt={activeRoot?.name || 'Категория'}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                    🛋
                  </div>
                )}
              </div>
              {activeRoot?.description && activeRoot.children?.length > 0 && (
                <p className="mt-3 text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {activeRoot.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-3 bg-white flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            onClick={() => onCategorySelect('')}
          >
            Весь каталог
          </button>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Выберите категорию, чтобы посмотреть ассортимент
          </span>
        </div>
      </div>
    </div>
  );
}
