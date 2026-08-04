import { useState } from 'react';

export default function MobileCatalogMenu({ categories, onCategorySelect }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleCategory = (category) => {
    if (category.children?.length > 0) {
      setExpandedId((prev) => (prev === category.uuid ? null : category.uuid));
      return;
    }
    onCategorySelect(category);
  };

  if (!categories.length) {
    return <p className="px-4 py-2 text-sm text-gray-400">Категории не найдены</p>;
  }

  return (
    <ul className="space-y-1">
      <li>
        <button
          type="button"
          onClick={() => onCategorySelect('')}
          className="w-full text-left px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          Весь каталог
        </button>
      </li>

      {categories.map((category) => {
        const hasChildren = category.children?.length > 0;
        const isExpanded = expandedId === category.uuid;

        return (
          <li key={category.uuid} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left text-gray-900 font-medium hover:bg-gray-50 transition-colors"
            >
              <span>{category.name}</span>
              {hasChildren ? (
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <span className="text-xs text-gray-400">перейти</span>
              )}
            </button>

            {hasChildren && isExpanded && (
              <ul className="px-4 pb-3 pt-1 space-y-0.5 border-t border-gray-100 bg-gray-50/60">
                <li>
                  <button
                    type="button"
                    onClick={() => onCategorySelect(category)}
                    className="w-full text-left py-3 min-h-[44px] text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Все: {category.name}
                  </button>
                </li>
                {category.children.map((child) => (
                  <li key={child.uuid}>
                    <button
                      type="button"
                      onClick={() => onCategorySelect(child)}
                      className="w-full text-left py-3 min-h-[44px] pl-3 text-sm text-gray-600 hover:text-blue-600 border-l-2 border-transparent hover:border-blue-200 transition-colors"
                    >
                      {child.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
