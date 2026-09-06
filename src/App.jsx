import { useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PropertyProvider } from './context/PropertyContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Property from './pages/Property';
import Contact from './pages/Contact';
import Book from './pages/Book';
import BookingStatus from './pages/BookingStatus';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <PropertyProvider>
      {/* covers a page that is already mounted and interactive underneath */}
      <SplashScreen />
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
          <Route path="/booking-status" element={<BookingStatus />} />
          {/* one template serves both houses; an unknown slug redirects home */}
          <Route path="/:slug" element={<Property />} />
        </Routes>
      </main>
      <Footer />
    </PropertyProvider>
  );
}
