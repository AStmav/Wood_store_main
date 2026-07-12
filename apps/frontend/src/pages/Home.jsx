import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SearchBar from '../components/SearchBar.jsx';
import NewsSection from '../components/NewsSection.jsx';
import BestsellersSection from '../components/BestsellersSection.jsx';
import { newsService } from '../api/newsService.js';
import { productService, buildSearchParams } from '../api/productService.js';

const DEFAULT_FILTERS = {
  category: '',
  minPrice: '',
  maxPrice: '',
  ordering: '-created_at',
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Категория из футера или другой навигации с state
  useEffect(() => {
    const selectedCategory = location.state?.selectedCategory;
    if (selectedCategory === undefined) {
      return;
    }

    if (selectedCategory === '') {
      setFilters(DEFAULT_FILTERS);
      setSearchTerm('');
    } else {
      setFilters((prev) =>
        prev.category === selectedCategory
          ? prev
          : { ...prev, category: selectedCategory },
      );
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.selectedCategory, location.pathname, navigate]);

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
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = buildSearchParams(searchTerm, filtersRef.current);
        const response = await productService.searchProducts(params);
        const productsData = response.results || response;

        if (!cancelled) {
          setProducts(productsData);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        if (!cancelled) {
          setError('Ошибка загрузки товаров. Попробуйте позже.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [searchTerm, filters]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <NewsSection news={news} loading={newsLoading} />

        <BestsellersSection />

        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Каталог товаров
        </h1>

        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            categories={categories}
            priceRange={priceRange}
          />
        </div>

        {error && (
          <ErrorMessage message={error} />
        )}

        {!error && loading && products.length === 0 && (
          <LoadingSpinner />
        )}

        {!error && !loading && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              {searchTerm || Object.values(filters).some((v) => v && v !== '-created_at')
                ? 'По вашему запросу ничего не найдено'
                : 'Товары не найдены'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm || Object.values(filters).some((v) => v && v !== '-created_at')
                ? 'Попробуйте изменить параметры поиска'
                : 'Добавьте товары через админ-панель'}
            </p>
          </div>
        )}

        {!error && products.length > 0 && (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-gray-50/70 pt-8">
                <LoadingSpinner />
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-6">
              {products.map((product) => (
                <div key={product.uuid} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-sm">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
