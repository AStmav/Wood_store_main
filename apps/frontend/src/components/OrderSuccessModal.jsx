import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccessModal = ({ isOpen, onClose, orderNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Заявка отправлена</h2>
        <p className="text-gray-600 mb-4">
          Спасибо! Менеджер получил ваш запрос на расчёт и свяжется с вами в ближайшее время.
        </p>
        {orderNumber && (
          <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-blue-700 font-medium">
            Номер заявки: {orderNumber}
          </div>
        )}
        <div className="flex flex-col space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Вернуться в каталог
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
