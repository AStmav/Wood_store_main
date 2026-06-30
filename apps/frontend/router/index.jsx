import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../src/pages/Home.jsx';
import Cart from '../src/pages/Cart.jsx';
import Favorites from '../src/pages/Favorites.jsx';
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
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/product/:uuid" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}
