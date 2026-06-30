import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { pageService } from '../api/pageService.js';
import { PERSONAL_DATA_POLICY_SLUG, PRIVACY_POLICY_SLUG } from '../constants/legal.js';

export default function LegalPage({ fallbackTitle, slug: slugProp }) {
  const { slug: routeSlug } = useParams();
  const slug = slugProp || routeSlug;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setError('Страница не найдена');
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await pageService.getBySlug(slug);
        setPage(data);
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Страница не найдена');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  const title = page?.title || fallbackTitle || 'Страница';
  const updatedAt = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            {updatedAt && <p className="text-gray-600">Дата последнего обновления: {updatedAt}</p>}
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-12">Загрузка...</div>
          )}

          {error && !loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-700 mb-4">{error}</p>
              <Link to="/" className="text-blue-600 hover:text-blue-700 underline">
                На главную
              </Link>
            </div>
          )}

          {page && !loading && (
            <div
              className="bg-white rounded-lg shadow-lg p-8 prose prose-gray max-w-none legal-page-content"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export function TermsPage() {
  return <LegalPage slug={PERSONAL_DATA_POLICY_SLUG} fallbackTitle="Пользовательское соглашение" />;
}

export function PrivacyPage() {
  return <LegalPage slug={PRIVACY_POLICY_SLUG} fallbackTitle="Политика конфиденциальности" />;
}
