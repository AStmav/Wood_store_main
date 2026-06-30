import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoriteContext.jsx';
import { useState, useEffect } from 'react';
import CategoryDropdown from './CategoryDropdown.jsx';
import { productService } from '../api/productService.js';
import logoImage from '../assets/images/logo.png';

export default function Header() {
  const { cartItemsCount } = useCart();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);

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
    
    // Очистка таймера при размонтировании
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsMobileCatalogOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCatalogMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsDropdownVisible(true);
  };

  const handleCatalogMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownVisible(false);
    }, 200); // Задержка 200мс для плавного UX
    setDropdownTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownVisible(false);
    }, 200);
    setDropdownTimeout(timeout);
  };

  // Функция выбора категории из выпадающего меню
  const handleCategorySelect = (categoryUuid) => {
    if (categoryUuid) {
      navigate(`/catalog/${categoryUuid}`);
    } else {
      navigate('/');
    }
    setIsDropdownVisible(false);
    setIsMobileMenuOpen(false);
    setIsMobileCatalogOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCatalogOpen(false);
  };

  const toggleMobileCatalog = () => {
    setIsMobileCatalogOpen((prev) => !prev);
  };

  return (
    <header className="bg-white shadow-sm border-b relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src={logoImage} 
                  alt="Сказкин дом" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-gray-900">Сказкин дом</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <div 
              className="relative"
              onMouseEnter={handleCatalogMouseEnter}
              onMouseLeave={handleCatalogMouseLeave}
            >
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-lg font-medium transition-colors cursor-pointer flex items-center"
              >
                Каталог
                <svg 
                  className="w-4 h-4 ml-1 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              <CategoryDropdown
                categories={categories}
                onCategorySelect={handleCategorySelect}
                isVisible={isDropdownVisible}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              />
            </div>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-lg font-medium transition-colors"
            >
              О нас
            </Link>

            <Link
              to="/favorites"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Избранное"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full h-5 w-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Корзина"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-3 md:hidden">
            <Link
              to="/favorites" 
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                title="Избранное"
                onClick={closeMobileMenu}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {favoritesCount}
                  </span>
              )}
            </Link>
            <Link
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Корзина"
              onClick={closeMobileMenu}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={closeMobileMenu}></div>
          <div className="md:hidden fixed top-16 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block text-lg font-semibold text-gray-900"
                onClick={closeMobileMenu}
              >
                Главная
              </Link>

              <div>
                <button
                  type="button"
                  onClick={toggleMobileCatalog}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 text-gray-800 font-medium"
                >
                  <span>Каталог</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isMobileCatalogOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMobileCatalogOpen && (
                  <ul className="mt-3 space-y-2 pl-2">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect('')}
                        className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Все категории
                      </button>
                    </li>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <li key={category.uuid}>
                          <button
                            type="button"
                            onClick={() => handleCategorySelect(category.uuid)}
                            className="w-full text-left px-4 py-2 rounded-md text-gray-800 font-medium hover:bg-blue-50 hover:text-blue-700"
                          >
                            {category.name}
                          </button>
                          {category.children?.length > 0 && (
                            <ul className="ml-3 mt-1 space-y-1 border-l border-gray-100 pl-2">
                              {category.children.map((child) => (
                                <li key={child.uuid}>
                                  <button
                                    type="button"
                                    onClick={() => handleCategorySelect(child.uuid)}
                                    className="w-full text-left px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    {child.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-gray-400">
                        Категории не найдены
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <Link
                to="/favorites"
                className="flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 text-gray-800 hover:border-blue-300 hover:text-blue-700"
                onClick={closeMobileMenu}
              >
                <span>Избранное</span>
                {favoritesCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 text-gray-800 hover:border-blue-300 hover:text-blue-700"
                onClick={closeMobileMenu}
              >
                <span>Корзина</span>
                {cartItemsCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
} 