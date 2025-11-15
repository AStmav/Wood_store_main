import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { trackSiteVisit } from '../api/analytics.js';

const Layout = ({ children }) => {
  const location = useLocation();
  const lastPathRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (lastPathRef.current === currentPath) {
      return;
    }
    lastPathRef.current = currentPath;
    trackSiteVisit(currentPath);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
