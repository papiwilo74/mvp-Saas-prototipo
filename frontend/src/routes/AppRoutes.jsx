import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { AppLayout } from '../layouts/AppLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { MenuPage } from '../pages/MenuPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

