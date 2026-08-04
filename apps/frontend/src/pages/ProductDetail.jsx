import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { productService } from '../api/productService.js';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SeoHead from '../components/SeoHead.jsx';
import { useMyProducts } from '../context/MyProductsContext.jsx';
import ProductPriceDisplay from '../components/ProductPriceDisplay.jsx';
import ProductImageGallery from '../components/ProductImageGallery.jsx';
import { trackProductView } from '../api/analytics.js';
import {
  isUuid,
  productPath,
  categoryPath,
  buildProductJsonLd,
  buildOrganizationJsonLd,
  buildBreadcrumbJsonLd,
} from '../seo/seoConfig.js';

const ProductDetail = () => {
  const { slugOrId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessage, setShowMessage] = useState(null);
  const { addProduct, isInMyProducts, removeProduct, items } = useMyProducts();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(slugOrId);
        setProduct(data);
      } catch (err) {
        console.error('Error loading product:', err);
        if (err.response?.status === 404) {
          setError('Товар не найден');
        } else if (err.response?.status >= 500) {
          setError('Ошибка сервера. Попробуйте позже.');
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError('Ошибка сети. Проверьте подключение к интернету.');
        } else {
          setError('Не удалось загрузить товар');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) {
      loadProduct();
    }
  }, [slugOrId]);

  useEffect(() => {
    if (product?.uuid) {
      trackProductView(product.uuid, { path: window.location.pathname });
    }
  }, [product?.uuid]);

  const inMyProducts = isInMyProducts(product?.uuid);

  const handleAddToMyProducts = async () => {
    const result = await addProduct(product.uuid);
    if (result.success) {
      setShowMessage(result.alreadyAdded ? 'Товар уже в списке' : 'Товар добавлен в «Мои товары»');
    } else {
      setShowMessage(result.error || 'Не удалось добавить товар');
    }
  };

  const handleRemoveFromMyProducts = async () => {
    const item = items.find((entry) => entry.product?.uuid === product.uuid);
    if (!item) return;
    await removeProduct(item.uuid);
    setShowMessage('Товар убран из списка');
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <ErrorMessage message="Товар не найден" />
      </Layout>
    );
  }

  // Канонический URL — slug; старые UUID-ссылки редиректим
  if (product.slug && isUuid(slugOrId) && slugOrId !== product.slug) {
    return <Navigate to={productPath(product)} replace />;
  }

  const ogImage =
    product.images?.[0]?.image || product.image || '/logo.png';
  const description =
    product.description ||
    `${product.name} — купить в Сказкин Дом, Якутск`;

  const crumbs = [
    { name: 'Главная', path: '/' },
    ...(product.category
      ? [{ name: product.category.name, path: categoryPath(product.category) }]
      : []),
    { name: product.name, path: productPath(product) },
  ];

  return (
    <Layout>
      <SeoHead
        title={product.name}
        description={description}
        path={productPath(product)}
        image={ogImage}
        jsonLd={[
          buildOrganizationJsonLd(),
          buildProductJsonLd(product),
          buildBreadcrumbJsonLd(crumbs),
        ]}
      />
      <div className="py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="mb-6 sm:mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Каталог
                </Link>
              </li>
              {product.category && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      to={categoryPath(product.category)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {product.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li className="min-w-0 break-words text-gray-900 font-medium">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ProductImageGallery product={product} />

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.category && (
                  <p className="text-base sm:text-lg mb-4">
                    <Link
                      to={categoryPath(product.category)}
                      className="text-blue-600 hover:underline"
                    >
                      {product.category.name}
                    </Link>
                  </p>
                )}
              </div>

              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Характеристики</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 border-b border-gray-200 pb-3 last:border-0"
                      >
                        <span className="text-gray-600 font-medium shrink-0">{key}:</span>
                        <span className="text-gray-900 font-semibold sm:text-right break-words min-w-0">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="mb-6">
                  <ProductPriceDisplay product={product} size="lg" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {inMyProducts ? (
                    <>
                      <Link
                        to="/my-products"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center"
                      >
                        Перейти в мои товары
                      </Link>
                      <button
                        type="button"
                        onClick={handleRemoveFromMyProducts}
                        className="px-6 py-3 rounded-lg text-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Убрать из списка
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToMyProducts}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>В мои товары</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Добавьте товар в список и отправьте запрос — менеджер рассчитает стоимость и свяжется с вами.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад к каталогу
            </Link>
          </div>
        </div>
      </div>

      {showMessage && (
        <div className="fixed bottom-24 sm:bottom-6 inset-x-0 flex justify-center z-[100]">
          <div className="bg-white shadow-lg px-4 py-3 rounded-lg text-gray-800 flex items-center space-x-3 mx-4">
            <span>{showMessage}</span>
            <button
              type="button"
              onClick={() => setShowMessage(null)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label="Закрыть уведомление"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetail;
