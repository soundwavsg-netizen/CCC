import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServicesSolutions from './pages/ServicesSolutions';
import Portfolio from './pages/Portfolio';
import Grants from './pages/Grants';
import EDG from './pages/EDG';
import Contact from './pages/Contact';
import PDPA from './pages/PDPA';
import Terms from './pages/Terms';
import Promotion from './pages/Promotion';
import AILibrary from './pages/AILibrary';
import WhatsAppSetup from './pages/WhatsAppSetup';
import { initializeTracking } from './utils/analytics';
import './App.css';

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return null;
};

export default function App() {
  // Initialize analytics on app load
  useEffect(() => {
    initializeTracking();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services-solutions" element={<ServicesSolutions />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/grants" element={<Grants />} />
            <Route path="/edg" element={<EDG />} />
            <Route path="/promotion" element={<Promotion />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/whatsapp-setup" element={<WhatsAppSetup />} />
            <Route path="/pdpa" element={<PDPA />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}