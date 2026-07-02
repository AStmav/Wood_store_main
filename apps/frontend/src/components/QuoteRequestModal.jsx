import { useState, useEffect } from 'react';
import { useOrders } from '../context/OrderContext.jsx';
import PersonalDataConsent from './PersonalDataConsent.jsx';

export default function QuoteRequestModal({ isOpen, onClose, items, onRequestCreated }) {
  const { createOrder } = useOrders();
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    comment: '',
    personal_data_consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        phone: '',
        email: '',
        comment: '',
        personal_data_consent: false,
      });
      setError('');
      setValidationErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
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

    if (!formData.email.trim()) {
      errors.email = 'Укажите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Введите корректный email';
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
      const itemsPayload = items.map((item) => ({
        product_id: item.product.uuid,
        quantity: 1,
      }));

      const orderData = {
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        comment: formData.comment.trim(),
        personal_data_consent: true,
        items: itemsPayload,
        delivery_type: 'pickup',
        payment_method: 'cash',
        address: '',
      };

      const result = await createOrder(orderData);

      if (result.success) {
        onRequestCreated(result.data);
        onClose();
      } else {
        const apiError = result.error;
        if (typeof apiError === 'object' && apiError) {
          const fieldErrors = {};
          ['phone', 'email', 'personal_data_consent'].forEach((field) => {
            if (apiError[field]) {
              fieldErrors[field] = Array.isArray(apiError[field]) ? apiError[field][0] : apiError[field];
            }
          });
          if (Object.keys(fieldErrors).length > 0) {
            setValidationErrors(fieldErrors);
          } else {
            setError('Ошибка отправки заявки');
          }
        } else {
          setError(typeof apiError === 'string' ? apiError : 'Ошибка отправки заявки');
        }
      }
    } catch (err) {
      console.error('Error creating quote request:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Ошибка отправки заявки');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Запрос расчёта</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Менеджер свяжется с вами, рассчитает стоимость и уточнит детали по выбранным товарам.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Интересует:</h3>
          <ul className="space-y-1 text-sm text-gray-800">
            {items.map((item) => (
              <li key={item.uuid}>• {item.product.name}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                validationErrors.email
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="example@mail.ru"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Доставка, размеры, сроки — всё, что важно для расчёта"
            />
          </div>

          <PersonalDataConsent
            checked={formData.personal_data_consent}
            onChange={handleInputChange}
            error={validationErrors.personal_data_consent}
          />

          <div className="flex justify-end space-x-4 pt-2">
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
              {loading ? 'Отправка...' : 'Отправить менеджеру'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
