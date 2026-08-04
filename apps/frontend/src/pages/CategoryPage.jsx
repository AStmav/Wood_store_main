import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SeoHead from '../components/SeoHead.jsx';
import ProductInfiniteGrid from '../components/ProductInfiniteGrid.jsx';
import { productService } from '../api/productService.js';
import usePaginatedProducts from '../hooks/usePaginatedProducts.js';
import {
  isUuid,
  categoryPath,
  buildOrganizationJsonLd,
  buildBreadcrumbJsonLd,
} from '../seo/seoConfig.js';

export default function CategoryPage() {
  const { slugOrId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const sleepSize = searchParams.get('sleep_size') || '';

  useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      try {
        setMetaLoading(true);
        setMetaError(null);
        const filtersData = await productService.getCategoryFilters(slugOrId);
        if (!cancelled) {
          setMeta(filtersData);
        }
      } catch (err) {
        console.error('Category meta error:', err);
        if (!cancelled) {
          setMetaError('Не удалось загрузить категорию.');
          setMeta(null);
        }
      } finally {
        if (!cancelled) {
          setMetaLoading(false);
        }
      }
    };

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [slugOrId]);

  const fetchPage = useCallback(
    async (page) =>
      productService.getCategoryProducts(slugOrId, {
        page,
        sleep_size: sleepSize || undefined,
      }),
    [slugOrId, sleepSize],
  );

  const {
    products,
    count,
    hasMore,
    loading,
    loadingMore,
    error: productsError,
    loadMore,
  } = usePaginatedProducts(fetchPage, [slugOrId, sleepSize]);

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

  if (metaError && !meta) {
    return (
      <Layout>
        <ErrorMessage message={metaError} />
      </Layout>
    );
  }

  if (category?.slug && isUuid(slugOrId) && slugOrId !== category.slug) {
    const qs = searchParams.toString();
    return (
      <Navigate
        to={`${categoryPath(category)}${qs ? `?${qs}` : ''}`}
        replace
      />
    );
  }

  const crumbLd = [
    { name: 'Главная', path: '/' },
    ...breadcrumbs.map((item) => ({
      name: item.name,
      path: categoryPath(item),
    })),
  ];

  return (
    <Layout>
      {category && (
        <SeoHead
          title={category.name}
          description={
            category.description ||
            `${category.name} — каталог Сказкин Дом в Якутске`
          }
          path={categoryPath(category)}
          image={category.image}
          jsonLd={[
            buildOrganizationJsonLd(),
            buildBreadcrumbJsonLd(crumbLd),
          ]}
        />
      )}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {metaLoading && !meta ? (
          <LoadingSpinner />
        ) : (
          <>
            {breadcrumbs.length > 0 && (
              <nav className="text-sm text-gray-500 mb-4 flex flex-wrap gap-1">
                <Link to="/" className="hover:text-blue-600">Главная</Link>
                {breadcrumbs.map((item) => (
                  <span key={item.uuid} className="flex items-center gap-1">
                    <span>/</span>
                    {item.slug === category?.slug || item.uuid === slugOrId ? (
                      <span className="text-gray-800 font-medium">{item.name}</span>
                    ) : (
                      <Link to={categoryPath(item)} className="hover:text-blue-600">
                        {item.name}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {category?.name}
            </h1>
            {category?.description && (
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-3xl">{category.description}</p>
            )}

            {children.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Подкатегории</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {children.map((child) => (
                    <Link
                      key={child.uuid}
                      to={categoryPath(child)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3 min-h-[44px] text-center hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center"
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
                    className={`min-h-[44px] px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
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
                      className={`min-h-[44px] px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
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

            {productsError && (
              <ErrorMessage message="Не удалось загрузить товары категории." />
            )}

            {!productsError && loading && products.length === 0 && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {!productsError && !loading && products.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                В этой категории пока нет товаров
              </div>
            )}

            {!productsError && products.length > 0 && (
              <ProductInfiniteGrid
                products={products}
                count={count}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
