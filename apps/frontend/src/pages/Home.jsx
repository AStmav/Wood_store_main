import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SeoHead from '../components/SeoHead.jsx';
import SearchBar from '../components/SearchBar.jsx';
import NewsSection from '../components/NewsSection.jsx';
import BestsellersSection from '../components/BestsellersSection.jsx';
import ProductInfiniteGrid from '../components/ProductInfiniteGrid.jsx';
import { newsService } from '../api/newsService.js';
import { productService, buildSearchParams } from '../api/productService.js';
import usePaginatedProducts from '../hooks/usePaginatedProducts.js';
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  buildOrganizationJsonLd,
} from '../seo/seoConfig.js';

const DEFAULT_FILTERS = {
  category: '',
  minPrice: '',
  maxPrice: '',
  ordering: '-created_at',
};

export default function Home() {
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
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

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

  const fetchPage = useCallback(async (page) => {
    const params = {
      ...buildSearchParams(searchTermRef.current, filtersRef.current),
      page,
    };
    return productService.searchProducts(params);
  }, []);

  const {
    products,
    count,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
  } = usePaginatedProducts(fetchPage, [searchTerm, filters]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const hasActiveQuery = searchTerm || Object.values(filters).some((v) => v && v !== '-created_at');

  return (
    <Layout>
      <SeoHead
        title={`${SITE_NAME} — детская мебель в Якутске`}
        description={DEFAULT_DESCRIPTION}
        path="/"
        jsonLd={buildOrganizationJsonLd()}
      />
      <div className="py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <NewsSection news={news} loading={newsLoading} />
        </div>

        <BestsellersSection />

        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-8 text-center">
            Сказкин Дом — каталог детской мебели
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
            <ErrorMessage message="Ошибка загрузки товаров. Попробуйте позже." />
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
                {hasActiveQuery ? 'По вашему запросу ничего не найдено' : 'Товары не найдены'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {hasActiveQuery
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
              <ProductInfiniteGrid
                products={products}
                count={count}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
