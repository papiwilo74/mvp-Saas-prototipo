import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { env } from '../config/env';

const RESERVED_SLUGS = new Set([
  'saas', 'registro', 'register', 'registro-restaurante', 'registro-negocio', 'registro-cliente',
  'menu', 'cart', 'admin', 'superadmin', 'login', 'checkout', 'profile', 'orders',
  'products', 'terms', 'privacy', 'verify-email', 'verificar-email', 'forgot-password', 'reset-password'
]);

function DynamicRestaurantRedirect() {
  const { slug } = useParams();
  if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) {
    return <NotFoundPage />;
  }
  return <Navigate to={`/?restaurant=${encodeURIComponent(slug)}`} replace />;
}

function DynamicRestaurantMenuRedirect() {
  const { slug } = useParams();
  if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) {
    return <NotFoundPage />;
  }
  return <Navigate to={`/menu?restaurant=${encodeURIComponent(slug)}`} replace />;
}

const handleDynamicImport = (importFn) => () =>
  importFn().catch((err) => {
    // Si falla cargar el chunk (ej. nuevo deploy en Vercel con nuevos hashes), forzar recarga limpia
    const isChunkError =
      err?.message?.includes('Failed to fetch dynamically imported module') ||
      err?.name === 'ChunkLoadError';
    if (isChunkError && !sessionStorage.getItem('chunk_reload_retry')) {
      sessionStorage.setItem('chunk_reload_retry', '1');
      window.location.reload();
      return new Promise(() => {});
    }
    sessionStorage.removeItem('chunk_reload_retry');
    throw err;
  });

const loadPage = (name) => handleDynamicImport(() => import(`../pages/${name}.jsx`).then((m) => ({ default: m[name] })));
const loadAdmin = (name) => handleDynamicImport(() => import(`../pages/admin/${name}.jsx`).then((m) => ({ default: m[name] })));
const loadSuper = (name) => handleDynamicImport(() => import(`../pages/superadmin/${name}.jsx`).then((m) => ({ default: m[name] })));
const loadLayout = (name) => handleDynamicImport(() => import(`../layouts/${name}.jsx`).then((m) => ({ default: m[name] })));

const SaasLayout = lazy(loadLayout('SaasLayout'));
const AppLayout = lazy(loadLayout('AppLayout'));
const AdminLayout = lazy(loadLayout('AdminLayout'));
const SuperAdminLayout = lazy(loadLayout('SuperAdminLayout'));

const NotFoundPage = lazy(loadPage('NotFoundPage'));
const LandingPage = lazy(loadPage('LandingPage'));
const MenuPage = lazy(loadPage('MenuPage'));
const ProductDetailPage = lazy(loadPage('ProductDetailPage'));
const CartPage = lazy(loadPage('CartPage'));
const CheckoutSuccessPage = lazy(loadPage('CheckoutSuccessPage'));
const LoginPage = lazy(loadPage('LoginPage'));
const RegisterPage = lazy(loadPage('RegisterPage'));
const ForgotPasswordPage = lazy(loadPage('ForgotPasswordPage'));
const ResetPasswordPage = lazy(loadPage('ResetPasswordPage'));
const TermsPage = lazy(loadPage('TermsPage'));
const PrivacyPage = lazy(loadPage('PrivacyPage'));
const OrderHistoryPage = lazy(loadPage('OrderHistoryPage'));
const ProfilePage = lazy(loadPage('ProfilePage'));
const SaasLandingPage = lazy(loadPage('SaasLandingPage'));
const RestaurantRegisterPage = lazy(loadPage('RestaurantRegisterPage'));
const VerifyEmailPage = lazy(loadPage('VerifyEmailPage'));

const AdminDashboardPage = lazy(loadAdmin('AdminDashboardPage'));
const AdminProductsPage = lazy(loadAdmin('AdminProductsPage'));
const AdminOrdersPage = lazy(loadAdmin('AdminOrdersPage'));
const AdminKitchenPage = lazy(loadAdmin('AdminKitchenPage'));
const AdminAnalyticsPage = lazy(loadAdmin('AdminAnalyticsPage'));
const AdminCustomersPage = lazy(loadAdmin('AdminCustomersPage'));
const AdminStaffPage = lazy(loadAdmin('AdminStaffPage'));
const AdminSettingsPage = lazy(loadAdmin('AdminSettingsPage'));

const SuperAdminDashboardPage = lazy(loadSuper('SuperAdminDashboardPage'));
const SuperAdminRestaurantsPage = lazy(loadSuper('SuperAdminRestaurantsPage'));
const SuperAdminRestaurantDetailPage = lazy(loadSuper('SuperAdminRestaurantDetailPage'));
const SuperAdminNewRestaurantPage = lazy(loadSuper('SuperAdminNewRestaurantPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-950" />
    </div>
  );
}

function RootLandingPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hasRestaurant = Boolean(params.get('restaurant'));

  return hasRestaurant ? (
    <AppLayout>
      <LandingPage />
    </AppLayout>
  ) : (
    <SaasLayout>
      <SaasLandingPage />
    </SaasLayout>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<PageLoader />}><RootLandingPage /></Suspense>} />

      {/* Rutas Institucionales y de Autenticación SaaS (OrderFlow) */}
      <Route element={<Suspense fallback={<PageLoader />}><SaasLayout /></Suspense>}>
        <Route path="/saas" element={<Suspense fallback={<PageLoader />}><SaasLandingPage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
        <Route path="/registro" element={<Suspense fallback={<PageLoader />}><RestaurantRegisterPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><RestaurantRegisterPage /></Suspense>} />
        <Route path="/registro-restaurante" element={<Suspense fallback={<PageLoader />}><RestaurantRegisterPage /></Suspense>} />
        <Route path="/registro-negocio" element={<Suspense fallback={<PageLoader />}><RestaurantRegisterPage /></Suspense>} />
        <Route path="/registro-cliente" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
        <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />
        <Route path="/verificar-email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPage /></Suspense>} />
      </Route>

      {/* Rutas de Catálogo y Pedidos de Tienda / Restaurante */}
      <Route element={<Suspense fallback={<PageLoader />}><AppLayout /></Suspense>}>
        <Route path="/menu" element={<Suspense fallback={<PageLoader />}><MenuPage /></Suspense>} />
        <Route path="/products/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
        <Route path="/cart" element={<Suspense fallback={<PageLoader />}><CartPage /></Suspense>} />
        <Route path="/checkout/success" element={<Suspense fallback={<PageLoader />}><CheckoutSuccessPage /></Suspense>} />
        {env.enableOrderHistory ? <Route path="/orders" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><OrderHistoryPage /></ProtectedRoute></Suspense>} /> : null}
        <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><ProfilePage /></ProtectedRoute></Suspense>} />
      </Route>

      <Route path="/admin" element={<Suspense fallback={<PageLoader />}><ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute></Suspense>}>
        <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<PageLoader />}><AdminProductsPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoader />}><AdminOrdersPage /></Suspense>} />
        <Route path="kitchen" element={<Suspense fallback={<PageLoader />}><AdminKitchenPage /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AdminAnalyticsPage /></Suspense>} />
        <Route path="customers" element={<Suspense fallback={<PageLoader />}><AdminCustomersPage /></Suspense>} />
        <Route path="staff" element={<Suspense fallback={<PageLoader />}><AdminStaffPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense>} />
      </Route>

      <Route path="/superadmin" element={<Suspense fallback={<PageLoader />}><ProtectedRoute requireSuperAdmin><SuperAdminLayout /></ProtectedRoute></Suspense>}>
        <Route index element={<Suspense fallback={<PageLoader />}><SuperAdminDashboardPage /></Suspense>} />
        <Route path="restaurants" element={<Suspense fallback={<PageLoader />}><SuperAdminRestaurantsPage /></Suspense>} />
        <Route path="restaurants/:id" element={<Suspense fallback={<PageLoader />}><SuperAdminRestaurantDetailPage /></Suspense>} />
        <Route path="new" element={<Suspense fallback={<PageLoader />}><SuperAdminNewRestaurantPage /></Suspense>} />
      </Route>

      {/* Rutas directas para comercios: ej. /aura-skin y /aura-skin/menu */}
      <Route path="/:slug" element={<Suspense fallback={<PageLoader />}><DynamicRestaurantRedirect /></Suspense>} />
      <Route path="/:slug/menu" element={<Suspense fallback={<PageLoader />}><DynamicRestaurantMenuRedirect /></Suspense>} />

      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
    </Routes>
  );
}
