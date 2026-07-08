import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { env } from '../config/env';
import { AdminLayout } from '../layouts/AdminLayout';
import { AppLayout } from '../layouts/AppLayout';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminKitchenPage } from '../pages/admin/AdminKitchenPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { MenuPage } from '../pages/MenuPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { SuperAdminDashboardPage } from '../pages/superadmin/SuperAdminDashboardPage';
import { SuperAdminNewRestaurantPage } from '../pages/superadmin/SuperAdminNewRestaurantPage';
import { SuperAdminRestaurantDetailPage } from '../pages/superadmin/SuperAdminRestaurantDetailPage';
import { SuperAdminRestaurantsPage } from '../pages/superadmin/SuperAdminRestaurantsPage';

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
        {env.enableOrderHistory ? <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} /> : null}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="kitchen" element={<AdminKitchenPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="/superadmin" element={<ProtectedRoute requireSuperAdmin><SuperAdminLayout /></ProtectedRoute>}>
        <Route index element={<SuperAdminDashboardPage />} />
        <Route path="restaurants" element={<SuperAdminRestaurantsPage />} />
        <Route path="restaurants/:id" element={<SuperAdminRestaurantDetailPage />} />
        <Route path="new" element={<SuperAdminNewRestaurantPage />} />
      </Route>

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
