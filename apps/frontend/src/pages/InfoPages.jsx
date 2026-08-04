import Layout from '../components/Layout.jsx';
import SeoHead from '../components/SeoHead.jsx';
import { Link } from 'react-router-dom';
import { SITE_NAME } from '../seo/seoConfig.js';

const PAGES = {
  delivery: {
    title: 'Доставка и сборка',
    path: '/delivery',
    description: 'Доставка и сборка детской мебели по Якутску — Сказкин Дом.',
    body: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          Мы доставляем мебель по Якутску и помогаем со сборкой. Сроки и стоимость
          зависят от объёма заказа и адреса — уточните у менеджера при оформлении заявки.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
          <li>Доставка по городу после согласования даты</li>
          <li>Аккуратная погрузка и разгрузка</li>
          <li>Сборка на месте по договорённости</li>
        </ul>
        <p className="text-gray-700">
          Связь:{' '}
          <a className="text-blue-600 hover:underline" href="https://wa.me/79141023232" target="_blank" rel="noopener noreferrer">
            +7 (914) 102-32-32
          </a>
        </p>
      </>
    ),
  },
  warranty: {
    title: 'Гарантия',
    path: '/warranty',
    description: 'Гарантийные условия на мебель Сказкин Дом.',
    body: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          На товары распространяется гарантия производителя. Срок и условия указаны
          в карточке товара или уточняются у менеджера при заказе.
        </p>
        <p className="text-gray-700">
          По вопросам гарантии напишите в WhatsApp или Telegram:{' '}
          <a className="text-blue-600 hover:underline" href="https://wa.me/79141023232" target="_blank" rel="noopener noreferrer">
            +7 (914) 102-32-32
          </a>
        </p>
      </>
    ),
  },
  installment: {
    title: 'Рассрочка',
    path: '/installment',
    description: 'Условия рассрочки и оплаты в Сказкин Дом.',
    body: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          Возможна оплата частями — детали зависят от суммы заказа и выбранного способа.
          Оставьте заявку через «Мои товары», и менеджер предложит удобный вариант.
        </p>
        <p className="text-gray-700">
          Консультация:{' '}
          <a className="text-blue-600 hover:underline" href="https://wa.me/79141023232" target="_blank" rel="noopener noreferrer">
            +7 (914) 102-32-32
          </a>
        </p>
      </>
    ),
  },
};

export function InfoPage({ pageKey }) {
  const page = PAGES[pageKey];
  if (!page) return null;

  return (
    <Layout>
      <SeoHead title={page.title} description={page.description} path={page.path} />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Главная</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-800">{page.title}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
        {page.body}
        <p className="mt-8 text-sm text-gray-500">{SITE_NAME}, Якутск</p>
      </div>
    </Layout>
  );
}

export function DeliveryPage() {
  return <InfoPage pageKey="delivery" />;
}

export function WarrantyPage() {
  return <InfoPage pageKey="warranty" />;
}

export function InstallmentPage() {
  return <InfoPage pageKey="installment" />;
}
