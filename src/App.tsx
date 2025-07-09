import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import GalleryPage from './pages/GalleryPage';
import EventsPage from './pages/EventsPage';
import BlogPage from './pages/BlogPage';
import FAQPage from './pages/FAQPage';
import ShippingPage from './pages/ShippingPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import CompetitionsPage from './pages/CompetitionsPage';
import InitiativesPage from './pages/InitiativesPage';
import InitiativeDetailPage from './pages/InitiativeDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/faq',
  '/shipping',
  '/auth/login',
  '/auth/signup',
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = location.hash;
      if (hash && hash.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/account');
      }
    };

    handleAuthCallback();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        const intendedPath = location.state?.from?.pathname;
        navigate(intendedPath || '/account');
      } else if (event === 'SIGNED_OUT' && !PUBLIC_ROUTES.includes(location.pathname)) {
        navigate('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        
        {/* Auth Routes */}
        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/gallery" element={
          <ProtectedRoute>
            <GalleryPage />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        } />
        <Route path="/blog" element={
          <ProtectedRoute>
            <BlogPage />
          </ProtectedRoute>
        } />
        <Route path="/competitions" element={
          <ProtectedRoute>
            <CompetitionsPage />
          </ProtectedRoute>
        } />
        <Route path="/initiatives" element={
          <ProtectedRoute>
            <InitiativesPage />
          </ProtectedRoute>
        } />
        <Route path="/initiatives/:id" element={
          <ProtectedRoute>
            <InitiativeDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreatePage />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/order-confirmation" element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute>
            <AdminOrdersPage />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;