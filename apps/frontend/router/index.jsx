import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../src/pages/Home.jsx';
import MyProducts from '../src/pages/MyProducts.jsx';
import NewsDetail from '../src/pages/NewsDetail.jsx';
import ProductDetail from '../src/pages/ProductDetail.jsx';
import CategoryPage from '../src/pages/CategoryPage.jsx';
import About from '../src/pages/About.jsx';
import LegalPage, { TermsPage, PrivacyPage } from '../src/pages/LegalPage.jsx';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog/:categoryUuid" element={<CategoryPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/pages/:slug" element={<LegalPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/cart" element={<Navigate to="/my-products" replace />} />
        <Route path="/favorites" element={<Navigate to="/my-products" replace />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/product/:uuid" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
