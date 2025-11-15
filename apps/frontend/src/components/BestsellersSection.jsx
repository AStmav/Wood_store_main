import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { productService } from '../api/productService';

const BestsellersSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getBestsellers(4.0, 6);
        setProducts(data);
      } catch (err) {
        console.error('Error loading bestsellers:', err);
        setError('Не удалось загрузить хиты продаж');
      } finally {
        setLoading(false);
      }
    };

    loadBestsellers();
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !products || products.length === 0) {
    return null; // Не показываем секцию, если нет товаров
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Заголовок секции */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Хит продаж
          </h2>
        </div>

        {/* Сетка товаров */}
        <div className="flex flex-wrap justify-center gap-6">
          {products.map(product => (
            <div key={product.uuid} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-sm">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestsellersSection;

