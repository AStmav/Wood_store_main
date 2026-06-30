import { useState, useEffect } from 'react';
import { useOrders } from '../context/OrderContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import PersonalDataConsent from './PersonalDataConsent.jsx';

export default function CheckoutModal({ isOpen, onClose, cart, onOrderCreated }) {
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    comment: '',
    personal_data_consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        phone: user?.phone || '',
        comment: '',
        personal_data_consent: false,
      });
      setError('');
      setValidationErrors({});
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const fieldName = name === 'personal_data_consent' ? 'personal_data_consent' : name;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }

    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.phone.trim()) {
      errors.phone = 'Номер телефона обязателен';
    } else if (!/^[\+]?\d[\d\s\-\(\)]{9,}$/.test(formData.phone.trim())) {
      errors.phone = 'Введите корректный номер телефона';
    }

    if (!formData.personal_data_consent) {
      errors.personal_data_consent = 'Отметьте согласие на обработку персональных данных, чтобы отправить заявку.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const itemsPayload = cart.items.map((item) => ({
        product_id: item.product.uuid,
        quantity: item.quantity,
      }));

      const orderData = {
        phone: formData.phone.trim(),
        comment: formData.comment.trim(),
        personal_data_consent: true,
        items: itemsPayload,
        delivery_type: 'pickup',
        payment_method: 'cash',
        address: '',
        email: user?.email || '',
      };

      const result = await createOrder(orderData);

      if (result.success) {
        onOrderCreated(result.data);
        onClose();
      } else {
        const apiError = result.error;
        if (typeof apiError === 'object' && apiError?.personal_data_consent) {
          setValidationErrors({
            personal_data_consent: Array.isArray(apiError.personal_data_consent)
              ? apiError.personal_data_consent[0]
              : apiError.personal_data_consent,
          });
        } else {
          setError(typeof apiError === 'string' ? apiError : 'Ошибка создания заказа');
        }
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Ошибка создания заказа');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = cart.total_amount
    ? parseFloat(cart.total_amount)
    : cart.items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Оформление заказа</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Контактные данные</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.phone
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="+7 (999) 123-45-67"
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий к заказу</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Дополнительная информация (необязательно)"
                />
              </div>

              <PersonalDataConsent
                checked={formData.personal_data_consent}
                onChange={handleInputChange}
                error={validationErrors.personal_data_consent}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Сумма товаров:</span>
              <span className="font-bold whitespace-nowrap text-gray-900">{formatPrice(totalAmount)} ₽</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Итого к оплате:</span>
              <span className="whitespace-nowrap font-bold text-gray-900">{formatPrice(totalAmount)} ₽</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Создание заказа...' : 'Отправить заказ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 