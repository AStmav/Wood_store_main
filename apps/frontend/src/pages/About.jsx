import React, { useState, useEffect } from 'react';
import { aboutService } from '../api/aboutService';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SeoHead from '../components/SeoHead.jsx';
import { getMediaUrl } from '../config/api';

const About = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await aboutService.getActiveAbout();
        setAbout(data);
      } catch (err) {
        setError('Не удалось загрузить информацию о компании');
        console.error('Error loading about:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!about) {
    return <ErrorMessage message="Информация о компании не найдена" />;
  }

  return (
    <Layout>
      <SeoHead
        title={about.title}
        description={(about.content || '').replace(/<[^>]+>/g, ' ').slice(0, 160)}
        path="/about"
        image={about.image}
      />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* Заголовок страницы */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {about.title}
          </h1>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Изображение */}
          {about.image && (
            <div className="w-full overflow-hidden flex justify-center items-center bg-gray-100 py-8">
              <img 
                src={getMediaUrl(about.image)}
                alt={about.title}
                className="max-w-full h-auto object-contain"
              />
            </div>
          )}

          {/* Текст */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: about.content }}
              />
            </div>
          </div>
        </div>

        {/* Кнопка "Назад на главную" */}
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад на главную
          </a>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default About; 