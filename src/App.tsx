import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CollectionsPage from './pages/salesPage.tsx';
import WishlistPage from './pages/WishlistPage.tsx';
import ProductDetailsPage from './pages/ProductDetailsPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import CategoryPage from './pages/CategoryPage.tsx';
import SearchResultsPage from './pages/SearchResultsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.tsx';
import PaymentCallbackPage from './pages/PaymentCallbackPage.tsx';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import CartDrawer from './components/cart/CartDrawer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <CartDrawer />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/men" element={<CategoryPage gender="men" />} />
                  <Route path="/women" element={<CategoryPage gender="women" />} />
                  <Route path="/kids" element={<CategoryPage gender="kids" />} />
                  <Route path="/new-arrivals" element={<CollectionsPage filter="new" />} />
                  <Route path="/sales" element={<CollectionsPage filter="sale" />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/payment/verify" element={<PaymentCallbackPage />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    {/* Feature pages will be added here */}
                  </Route>
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
