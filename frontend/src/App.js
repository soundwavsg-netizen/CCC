import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
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
import AIEmployees from './pages/AIEmployees';
import Demos from './pages/Demos';
import Admin from './pages/Admin';
import MathAnalysis from './pages/MathAnalysis';
import TutorAdmin from './pages/TutorAdmin';
import TutorLogin from './pages/TutorLogin';
import Project62Landing from './pages/Project62Landing';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import DigitalCheckout from './pages/DigitalCheckout';
import MealPrepCheckout from './pages/MealPrepCheckout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TuitionCentreDemo from './components/demos/TuitionCentreDemo';
import MSuppliesDemo from './components/demos/MSuppliesDemo';
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

// Layout wrapper to conditionally show Header/Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isProject62 = location.pathname.startsWith('/project62');
  
  if (isProject62) {
    return <div className="flex flex-col min-h-screen">{children}</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
      <Toaster position="top-right" />
    </div>
  );
};

export default function App() {
  // Initialize analytics on app load
  useEffect(() => {
    initializeTracking();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
              <Route path="/ai-employees" element={<AIEmployees />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services-solutions" element={<ServicesSolutions />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/demos" element={<Demos />} />
              <Route path="/demo/tuition" element={<TuitionCentreDemo />} />
              <Route path="/demo/ecommerce" element={<MSuppliesDemo />} />
              <Route path="/demo/math-analysis" element={<MathAnalysis />} />
              <Route path="/tutor/login" element={<TutorLogin />} />
              <Route path="/admin/tutors" element={<TutorAdmin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/project62" element={<Project62Landing />} />
              <Route path="/project62/login" element={<CustomerLogin />} />
              <Route path="/project62/auth/verify" element={<CustomerLogin />} />
              <Route path="/project62/dashboard" element={<CustomerDashboard />} />
              <Route path="/project62/admin" element={<AdminDashboard />} />
              <Route path="/project62/shop" element={<Shop />} />
              <Route path="/project62/product/:slug" element={<ProductDetail />} />
              <Route path="/project62/checkout/digital/:productId" element={<DigitalCheckout />} />
              <Route path="/project62/checkout/digital" element={<DigitalCheckout />} />
              <Route path="/project62/checkout/meal-prep" element={<MealPrepCheckout />} />
              <Route path="/project62/checkout/success" element={<PaymentSuccess />} />
              <Route path="/project62/checkout/cancel" element={<PaymentCancel />} />
              <Route path="/grants" element={<Grants />} />
              <Route path="/edg" element={<EDG />} />
              <Route path="/promotion" element={<Promotion />} />
              <Route path="/AILibrary" element={<AILibrary />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/whatsapp-setup" element={<WhatsAppSetup />} />
              <Route path="/pdpa" element={<PDPA />} />
              <Route path="/terms" element={<Terms />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}