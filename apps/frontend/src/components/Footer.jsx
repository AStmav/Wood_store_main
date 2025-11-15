import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../api/productService.js';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const filtersData = await productService.getFilters();
        setCategories(filtersData.categories || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Функция выбора категории из футера
  const handleCategorySelect = (categoryUuid) => {
    navigate('/', { state: { selectedCategory: categoryUuid } });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Основной контент футера */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          
          {/* О компании */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-white">О компании</h3>
            <Link to="/about" className="block group">
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors cursor-pointer">
                Сказкин дом<br />
                детская мебель и игрушки
              </p>
            </Link>
          </div>

          {/* Каталог */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-white">Каталог</h3>
            <ul className="space-y-2 text-sm">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.uuid} className="flex justify-center">
                    <button
                      onClick={() => handleCategorySelect(category.uuid)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {category.name}
                    </button>
                  </li>
                ))
              ) : (
                // Fallback статичные категории, если API не работает
                <>
                  <li className="flex justify-center"><button className="text-gray-400 hover:text-white transition-colors">Гостиная</button></li>
                  <li className="flex justify-center"><button className="text-gray-400 hover:text-white transition-colors">Спальня</button></li>
                  <li className="flex justify-center"><button className="text-gray-400 hover:text-white transition-colors">Кухня</button></li>
                  <li className="flex justify-center"><button className="text-gray-400 hover:text-white transition-colors">Детская</button></li>
                  <li className="flex justify-center"><button className="text-gray-400 hover:text-white transition-colors">Офисная мебель</button></li>
                  <li className="flex justify-center"><button className="text-gray-400 hover:text-white transition-colors">Прихожая</button></li>
                </>
              )}
            </ul>
          </div>

          {/* Покупателям */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-white">Покупателям</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-center"><a href="#" className="text-gray-400 hover:text-white transition-colors">Доставка и сборка</a></li>
              <li className="flex justify-center"><a href="#" className="text-gray-400 hover:text-white transition-colors">Гарантия</a></li>
              <li className="flex justify-center"><a href="#" className="text-gray-400 hover:text-white transition-colors">Рассрочка</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-white">Контакты</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center space-x-3 group">
                <svg className="w-5 h-5 min-w-[20px] text-gray-400 group-hover:text-green-400 transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <a href="https://wa.me/79141023232" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  +7 (914) 102-32-32
                </a>
              </div>
              <div className="flex items-center justify-center space-x-3 group">
                <svg className="w-5 h-5 min-w-[20px] text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <a 
                  href="https://t.me/+79141023232" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  +7 (914) 102-32-32
                </a>
              </div>
              <div className="flex items-center justify-center space-x-3 group">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <a 
                  href="https://2gis.ru/yakutsk/firm/70000001074352815?m=129.755651%2C62.031821%2F16" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                  title="Открыть магазин на карте 2ГИС"
                >
                  г. Якутск, 203 мкр
                </a>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 min-w-[20px] text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400">
                  Пн-Пт: 10:00-20:00<br />
                  Сб-Вс: 10:00-20:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя часть футера */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Политика конфиденциальности</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Пользовательское соглашение</Link>
              <div className="text-gray-400 text-sm pt-2">
                © 2024 Сказкин Дом. Все права защищены.
              </div>
            </div>
 
            <div className="text-xs text-gray-500 leading-relaxed max-w-3xl mx-auto md:mx-0 text-center md:text-left">
              <p>
                Предоставленная на сайте информация несёт справочный характер. Информация на сайте не является публичной офертой, определяемой положениями Статьи 437 ГК РФ. Цвет и фактура мебели могут отличаться от цвета и фактуры на фото в связи с различной цветопередачей и настройками монитора.
              </p>
              <p className="mt-2">
                Цены на товар не являются офертой. Окончательная стоимость заказа будет определена на момент выставления счёта при условии его оплаты не позднее 1 рабочего дня.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;