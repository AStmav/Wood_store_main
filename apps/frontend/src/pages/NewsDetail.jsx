import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsService } from '../api/newsService';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SeoHead from '../components/SeoHead.jsx';
import { getMediaUrl } from '../config/api';

const NewsDetail = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading news with slug:', slug);
        const data = await newsService.getNewsBySlug(slug);
        console.log('News data received:', data);
        setNews(data);
      } catch (err) {
        console.error('Error loading news:', err);
        if (err.response?.status === 404) {
          setError('Новость не найдена');
        } else if (err.response?.status >= 500) {
          setError('Ошибка сервера. Попробуйте позже.');
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError('Ошибка сети. Проверьте подключение к интернету.');
        } else {
          setError('Не удалось загрузить новость');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadNews();
    }
  }, [slug]);

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

  if (!news) {
    return (
      <Layout>
        <ErrorMessage message="Новость не найдена" />
      </Layout>
    );
  }

  return (
    <Layout>
      <SeoHead
        title={news.title}
        description={news.excerpt || news.title}
        path={`/news/${news.slug}`}
        image={news.image}
      />
      <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Хлебные крошки */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Главная
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Новости
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">
              {news.title}
            </li>
          </ol>
        </nav>

        {/* Основной контент */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Изображение */}
          {news.image && (
            <div className="w-full overflow-hidden flex justify-center items-center bg-gray-100 py-8">
              <img 
                src={getMediaUrl(news.image)}
                alt={news.title}
                className="max-w-full h-auto object-contain"
              />
            </div>
          )}

          {/* Заголовок и мета-информация */}
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {news.title}
              </h1>
              <div className="text-sm text-gray-600">
                <span>
                  Опубликовано: {new Date(news.published_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </header>

            {/* Краткое описание */}
            {news.excerpt && (
              <div className="mb-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {news.excerpt}
                </p>
              </div>
            )}

            {/* Основной контент */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
          </div>
        </article>

        {/* Кнопка "Назад к новостям" */}
        <div className="mt-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к новостям
          </Link>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default NewsDetail; 