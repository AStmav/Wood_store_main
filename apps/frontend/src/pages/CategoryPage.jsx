import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { productService } from '../api/productService.js';

export default function CategoryPage() {
  const { categoryUuid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sleepSize = searchParams.get('sleep_size') || '';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [filtersData, productsData] = await Promise.all([
        productService.getCategoryFilters(categoryUuid),
        productService.getCategoryProducts(categoryUuid, {
          sleep_size: sleepSize || undefined,
        }),
      ]);
      setMeta(filtersData);
      setProducts(productsData.results || productsData);
    } catch (err) {
      console.error('Category page error:', err);
      setError('Не удалось загрузить категорию.');
    } finally {
      setLoading(false);
    }
  }, [categoryUuid, sleepSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSleepSize = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value && next.get('sleep_size') === value) {
      next.delete('sleep_size');
    } else if (value) {
      next.set('sleep_size', value);
    } else {
      next.delete('sleep_size');
    }
    setSearchParams(next);
  };

  const category = meta?.category;
  const breadcrumbs = category?.breadcrumbs || [];
  const children = meta?.children || [];
  const sleepSizes = meta?.sleep_sizes || [];

  if (error && !meta) {
    return (
      <Layout>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {loading && !meta ? (
          <LoadingSpinner fullScreen />
        ) : (
          <>
        {breadcrumbs.length > 0 && (
          <nav className="text-sm text-gray-500 mb-4 flex flex-wrap gap-1">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            {breadcrumbs.map((item) => (
              <span key={item.uuid} className="flex items-center gap-1">
                <span>/</span>
                {item.uuid === categoryUuid ? (
                  <span className="text-gray-800 font-medium">{item.name}</span>
                ) : (
                  <Link to={`/catalog/${item.uuid}`} className="hover:text-blue-600">
                    {item.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {category?.name}
        </h1>
        {category?.description && (
          <p className="text-gray-600 mb-8 max-w-3xl">{category.description}</p>
        )}

        {children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Подкатегории</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {children.map((child) => (
                <Link
                  key={child.uuid}
                  to={`/catalog/${child.uuid}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{child.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {sleepSizes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Размер спального места</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSleepSize('')}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  !sleepSize
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                Все размеры
              </button>
              {sleepSizes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSleepSize(item.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    sleepSize === item.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {item.value}
                  <span className="ml-1 text-xs opacity-75">({item.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            В этой категории пока нет товаров
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {products.map((product) => (
              <div
                key={product.uuid}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-sm"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </Layout>
  );
}
