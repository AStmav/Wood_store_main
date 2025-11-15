import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SearchBar from '../components/SearchBar.jsx';
import NewsSection from '../components/NewsSection.jsx';
import BestsellersSection from '../components/BestsellersSection.jsx';
import { newsService } from '../api/newsService.js';
import { productService, buildSearchParams } from '../api/productService.js';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    availableOnly: false,
    popularOnly: false,
    ordering: '-created_at'
  });
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const location = useLocation();

  // Обработка выбранной категории из навигации
  useEffect(() => {
    if (location.state?.selectedCategory !== undefined) {
      if (location.state.selectedCategory === '') {
        // Если выбрана "Все категории", сбрасываем все фильтры
        setFilters({
          category: '',
          minPrice: '',
          maxPrice: '',
          availableOnly: false,
          ordering: '-created_at'
        });
        setSearchTerm('');
      } else if (location.state.selectedCategory) {
        // Если выбрана конкретная категория, устанавливаем её
        setFilters(prev => ({
          ...prev,
          category: location.state.selectedCategory
        }));
      }
      // Очищаем состояние навигации
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Сброс фильтров при переходе на главную страницу без выбора категории
  useEffect(() => {
    // Если мы на главной странице и нет выбранной категории, сбрасываем фильтры
    if (location.pathname === '/' && !location.state?.selectedCategory) {
      setFilters({
        category: '',
        minPrice: '',
        maxPrice: '',
        availableOnly: false,
        ordering: '-created_at'
      });
      setSearchTerm('');
    }
  }, [location.pathname, location.state]);

  // Загрузка новостей
  useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true);
        const newsData = await newsService.getActiveNews(6);
        setNews(newsData || []);
      } catch (err) {
        console.error('Error loading news:', err);
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    loadNews();
  }, []);

  // Загрузка фильтров при монтировании компонента
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filtersData = await productService.getFilters();
        setCategories(filtersData.categories || []);
        setPriceRange(filtersData.price_range || { min: 0, max: 0 });
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };

    loadFilters();
  }, []);

  // Загрузка продуктов с поиском и фильтрацией
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const params = buildSearchParams(searchTerm, filters);
        
        const response = await productService.searchProducts(params);
        
        // Django REST Framework возвращает объект с полем results
        const productsData = response.results || response;
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Ошибка загрузки товаров. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, filters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Слайдер новостей */}
        <NewsSection news={news} loading={newsLoading} />
        
        {/* Хиты продаж */}
        <BestsellersSection />
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Каталог товаров
        </h1>
        
        {/* Поиск и фильтры */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            categories={categories}
            priceRange={priceRange}
          />
        </div>

        {/* Результаты поиска */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {searchTerm || Object.values(filters).some(v => v && v !== '-created_at') 
                ? 'По вашему запросу ничего не найдено' 
                : 'Товары не найдены'
              }
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm || Object.values(filters).some(v => v && v !== '-created_at')
                ? 'Попробуйте изменить параметры поиска'
                : 'Добавьте товары через админ-панель'
              }
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {products.map(product => (
              <div key={product.uuid} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-sm">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 