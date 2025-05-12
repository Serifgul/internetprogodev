import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AddressesPage from './pages/AddressesPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/auth/PrivateRoute';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
  const { isAuthenticated, user } = useAuth();
  const { fetchCart } = useCart();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    }
  }, [isAuthenticated, user, fetchCart]);

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/category/:categoryId" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/checkout" element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          } />
          
          <Route path="/account" element={
            <PrivateRoute>
              <AccountPage />
            </PrivateRoute>
          } />
          
          <Route path="/orders" element={
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          } />
          
          <Route path="/orders/:id" element={
            <PrivateRoute>
              <OrderDetailPage />
            </PrivateRoute>
          } />
          
          <Route path="/addresses" element={
            <PrivateRoute>
              <AddressesPage />
            </PrivateRoute>
          } />
          
          <Route path="/wishlist" element={
            <PrivateRoute>
              <WishlistPage />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;