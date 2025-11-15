import React from 'react';
import NewsSlide from './NewsSlide.jsx';
import NewsSlider from './NewsSlider.jsx';

const NewsSection = ({ news, loading }) => {
  // Если загрузка или нет новостей - не показываем секцию
  if (loading || !news || news.length === 0) {
    return null;
  }

  // 1 новость - показываем одну карточку по центру
  if (news.length === 1) {
    return (
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Последние новости</h2>
          <p className="text-gray-600">Будьте в курсе событий нашего магазина</p>
        </div>
        <div className="flex justify-center">
          <div className="max-w-md w-full">
            <NewsSlide news={news[0]} isActive={true} />
          </div>
        </div>
      </div>
    );
  }

  // 2 новости - показываем две карточки рядом
  if (news.length === 2) {
    return (
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Последние новости</h2>
          <p className="text-gray-600">Будьте в курсе событий нашего магазина</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {news.map(item => (
            <NewsSlide key={item.uuid} news={item} isActive={true} />
          ))}
        </div>
      </div>
    );
  }

  // 3+ новости - показываем слайдер
  return (
    <div className="mb-8">
      {/* Заголовок новостного раздела */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Последние новости</h2>
        <p className="text-gray-600">Будьте в курсе событий нашего магазина</p>
      </div>
      <NewsSlider news={news} />
    </div>
  );
};

export default NewsSection; 