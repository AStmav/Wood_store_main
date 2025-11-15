import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Проверяем, дал ли пользователь согласие
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Небольшая задержка для плавного появления
      setTimeout(() => {
        setShowBanner(true);
        setIsAnimating(true);
      }, 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    hideBanner();
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    hideBanner();
  };

  const hideBanner = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  if (!showBanner) return null;

  return (
    <div className={`cookie-banner ${isAnimating ? 'cookie-banner--show' : 'cookie-banner--hide'}`}>
      <div className="cookie-banner__container">
        <div className="cookie-banner__content">
          <div className="cookie-banner__icon">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="cookie-banner__text">
            <h4 className="cookie-banner__title">Мы используем cookies</h4>
            <p className="cookie-banner__description">
              Мы используем cookies для улучшения работы сайта, анализа трафика и персонализации контента. 
              Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
              <a href="/privacy" className="cookie-banner__link">
                политикой конфиденциальности
              </a>.
            </p>
          </div>
        </div>
        <div className="cookie-banner__actions">
          <button
            onClick={declineCookies}
            className="cookie-banner__button cookie-banner__button--decline"
            aria-label="Отклонить cookies"
          >
            Отклонить
          </button>
          <button
            onClick={acceptCookies}
            className="cookie-banner__button cookie-banner__button--accept"
            aria-label="Принять cookies"
          >
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
