import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CookieBanner from '../src/components/CookieBanner.jsx';
import YandexMetrika from '../src/components/YandexMetrika.jsx';
import LoadingSpinner from '../src/components/LoadingSpinner.jsx';

const Home = lazy(() => import('../src/pages/Home.jsx'));
const MyProducts = lazy(() => import('../src/pages/MyProducts.jsx'));
const NewsDetail = lazy(() => import('../src/pages/NewsDetail.jsx'));
const ProductDetail = lazy(() => import('../src/pages/ProductDetail.jsx'));
const CategoryPage = lazy(() => import('../src/pages/CategoryPage.jsx'));
const About = lazy(() => import('../src/pages/About.jsx'));
const LegalPage = lazy(() => import('../src/pages/LegalPage.jsx'));
const TermsPage = lazy(() =>
  import('../src/pages/LegalPage.jsx').then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import('../src/pages/LegalPage.jsx').then((m) => ({ default: m.PrivacyPage })),
);
const DeliveryPage = lazy(() =>
  import('../src/pages/InfoPages.jsx').then((m) => ({ default: m.DeliveryPage })),
);
const WarrantyPage = lazy(() =>
  import('../src/pages/InfoPages.jsx').then((m) => ({ default: m.WarrantyPage })),
);
const InstallmentPage = lazy(() =>
  import('../src/pages/InfoPages.jsx').then((m) => ({ default: m.InstallmentPage })),
);

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <YandexMetrika />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog/:slugOrId" element={<CategoryPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/installment" element={<InstallmentPage />} />
          <Route path="/pages/:slug" element={<LegalPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/cart" element={<Navigate to="/my-products" replace />} />
          <Route path="/favorites" element={<Navigate to="/my-products" replace />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/product/:slugOrId" element={<ProductDetail />} />
        </Routes>
      </Suspense>
      <CookieBanner />
    </BrowserRouter>
  );
}
