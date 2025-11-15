import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPromptModal = ({ isOpen, onClose, productName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Блокируем скролл страницы когда модальное окно открыто
  useEffect(() => {
    if (isOpen && !isClosing) {
      // Небольшая задержка для плавного появления
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50); // Увеличиваем задержку
      
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      
      // Блокируем скролл
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Обработчик клавиши Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        // Восстанавливаем скролл при закрытии
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        
        // Убираем обработчик клавиши Escape
        document.removeEventListener('keydown', handleEscape);
      };
    } else if (!isOpen && isVisible && !isClosing) {
      setIsClosing(true);
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
    }
  }, [isOpen, isClosing, isVisible]);

  const handleClose = () => {
    if (isClosing) return; // Предотвращаем множественные закрытия
    
    setIsClosing(true);
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center transition-all duration-200 ${
        isAnimating ? 'bg-black bg-opacity-50' : 'bg-transparent'
      }`}
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
      onClick={(e) => {
        // Закрываем модальное окно при клике на фон
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className={`bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transition-all duration-200 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на содержимое
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Войдите в аккаунт</h3>
          <p className="text-gray-600">
            Чтобы добавить <span className="font-semibold text-blue-600">"{productName}"</span> в избранное, 
            необходимо войти в аккаунт или зарегистрироваться
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/login"
            onClick={handleClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Войти</span>
          </Link>
          
          <Link
            to="/register"
            onClick={handleClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Зарегистрироваться</span>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Продолжить без входа
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
