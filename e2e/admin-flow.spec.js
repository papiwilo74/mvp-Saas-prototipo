import { test, expect } from '@playwright/test';
import crypto from 'crypto';

const CSRF_TOKEN = crypto.randomBytes(32).toString('hex');
const ADMIN_USER = { id: 'admin-1', name: 'Admin', email: 'admin@demo.com', role: 'ADMIN', restaurantId: 'rest-1', restaurantSlug: 'demo-burger' };
const SUPER_ADMIN_USER = { id: 'sa-1', name: 'Super Admin', email: 'super@admin.com', role: 'SUPERADMIN', restaurantId: null, restaurantSlug: null };

const RESTAURANT_CONFIG_MOCK = {
  restaurant: {
    id: 'rest-1',
    name: 'Demo Burger',
    slug: 'demo-burger',
    config: {
      restaurantName: 'Demo Burger',
      primaryColor: '#ea580c',
      secondaryColor: '#18181b',
      paymentMethods: ['CASH', 'NEQUI', 'CARD']
    }
  }
};

const mockOrder = (id, number, status, overrides = {}) => ({
  id, orderNumber: number, status,
  paymentMethod: 'CASH', subtotal: 15000, deliveryFeeApplied: 5000, discountAmount: 0, pointsRedeemed: 0,
  total: 20000, customerName: 'Juan Perez', customerPhone: '3001234567', customerEmail: '',
  customerAddress: 'Calle 123 #45-67', deliveryZoneName: 'Norte', couponCode: null,
  scheduledFor: null, notes: '', createdAt: new Date().toISOString(),
  items: [{ id: `oi-${id}`, productId: 'prod-1', quantity: 1, unitPrice: 15000, subtotal: 15000 }],
  ...overrides
});

function mockHeaders() {
  return {
    'content-type': 'application/json',
    'set-cookie': `csrf-token=${CSRF_TOKEN}; Path=/`,
    'access-control-allow-origin': 'http://localhost:5173',
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization, x-csrf-token',
  };
}

test.describe('Flujo administrador: login, gestion de pedidos y superadmin', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: 'csrf-token', value: CSRF_TOKEN, domain: 'localhost', path: '/' },
    ]);
  });

  test('admin filtra y cambia estado de pedidos', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    const orders = [
      mockOrder('order-1', 41, 'PENDING'),
      mockOrder('order-2', 42, 'PREPARING'),
      mockOrder('order-3', 43, 'DELIVERED'),
    ];

    await page.route(/\/api\/auth\/login/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: ADMIN_USER }),
        headers: {
          ...mockHeaders(),
          'set-cookie': `ff_token=admin-jwt; Path=/; HttpOnly; SameSite=Lax, csrf-token=${CSRF_TOKEN}; Path=/`,
        },
      });
    });

    await page.route(/\/api\/auth\/me/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: ADMIN_USER }),
        headers: mockHeaders(),
      });
    });

    await page.route(/\/api\/onboarding\/status/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ completed: true }), headers: mockHeaders() });
    });

    await page.route(/\/api\/reports/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: {}, products: [] }), headers: mockHeaders() });
    });

    await page.route(/\/api\/analytics/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}), headers: mockHeaders() });
    });

    let lastStatusFilter = '';

    await page.route(/\/api\/orders\/admin/, async (route) => {
      const url = new URL(route.request().url());
      const statusFilter = url.searchParams.get('status') || '';
      lastStatusFilter = statusFilter;
      const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orders: filtered,
          total: filtered.length,
          page: 1,
          pageSize: 20,
          pagination: { page: 1, totalPages: 1, pageSize: 20 },
        }),
        headers: mockHeaders(),
      });
    });

    await page.route(/\/api\/orders\/.*\/status/, async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      const url = route.request().url();
      const order = orders.find((o) => url.includes(o.id)) || orders[0];
      order.status = body.status;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ order }),
        headers: mockHeaders(),
      });
    });

    await page.route(/\/api\/restaurant-config/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(RESTAURANT_CONFIG_MOCK),
        headers: mockHeaders(),
      });
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/admin**');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('#41')).toBeVisible();
    await expect(page.getByText('#42')).toBeVisible();
    await expect(page.getByText('#43')).toBeVisible();
    await expect(page.locator('tr:has(> td:text("#41"))').locator('span').filter({ hasText: /^Pendiente$/ })).toBeVisible();
    await expect(page.locator('tr:has(> td:text("#42"))').locator('span').filter({ hasText: /^Preparando$/ })).toBeVisible();
    await expect(page.locator('tr:has(> td:text("#43"))').locator('span').filter({ hasText: /^Entregado$/ })).toBeVisible();

    // Filtro por PREPARING
    await page.selectOption('select:below(:text("Estado"))', 'PREPARING');
    await page.waitForTimeout(500);
    expect(lastStatusFilter).toBe('PREPARING');
    await expect(page.getByText('#42')).toBeVisible();
    await expect(page.getByText('#41')).not.toBeVisible();

    // Limpiar filtro
    await page.selectOption('select:below(:text("Estado"))', '');
    await page.waitForTimeout(500);

    // Cambiar estado de #41 a PREPARING
    const statusSelect = page.locator('tr:has(> td:text("#41")) select');
    await statusSelect.selectOption('PREPARING');
    await page.waitForTimeout(500);
    await expect(page.locator('tr:has(> td:text("#41"))').locator('span').filter({ hasText: /^Preparando$/ })).toBeVisible();
  });

  test('superadmin ve lista de restaurantes', async ({ page }) => {
    await page.route(/\/api\/auth\/login/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: SUPER_ADMIN_USER }),
        headers: {
          ...mockHeaders(),
          'set-cookie': `ff_token=sa-jwt; Path=/; HttpOnly; SameSite=Lax, csrf-token=${CSRF_TOKEN}; Path=/`,
        },
      });
    });

    await page.route(/\/api\/auth\/me/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: SUPER_ADMIN_USER }),
        headers: mockHeaders(),
      });
    });

    await page.route(/\/api\/superadmin\/restaurants/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          restaurants: [
            { id: 'rest-1', name: 'Demo Burger', slug: 'demo-burger', isActive: true, _count: { orders: 42, products: 15, categories: 5 } },
            { id: 'rest-2', name: 'Pizza Roma', slug: 'pizza-roma', isActive: true, _count: { orders: 28, products: 20, categories: 3 } },
          ],
        }),
        headers: mockHeaders(),
      });
    });

    await page.route(/\/api\/superadmin\/stats/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRestaurants: 2,
          totalOrders: 70,
          activeToday: 12,
          totalProducts: 35,
          recentOrders: [
            { id: 'ro-1', orderNumber: 101, restaurantName: 'Demo Burger', customerName: 'Carlos', total: 35000, createdAt: new Date().toISOString() },
          ],
        }),
        headers: mockHeaders(),
      });
    });

    await page.route(/\/api\/restaurant-config/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(RESTAURANT_CONFIG_MOCK),
        headers: mockHeaders(),
      });
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'super@admin.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/superadmin**');

    // Dashboard
    await expect(page.getByText('Panel de control')).toBeVisible();
    await expect(page.getByText('70')).toBeVisible();

    // Lista de restaurantes
    await page.goto('/superadmin/restaurants');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Demo Burger')).toBeVisible();
    await expect(page.getByText('Pizza Roma')).toBeVisible();
    await expect(page.getByText('42')).toBeVisible();
    await expect(page.getByText('28')).toBeVisible();
  });

  test('pantalla de login y registro muestra layout limpio de OrderFlow sin Demo Burger', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Debe mostrar branding institucional OrderFlow en header y footer
    const brandingLink = page.getByRole('link', { name: 'OrderFlow SaaS para negocios' });
    await expect(brandingLink).toBeVisible();
    await expect(page.getByText('SaaS para negocios')).toBeVisible();
    await expect(page.getByText('Calculadora de Ahorro')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();

    // NUNCA debe mostrar el encabezado de Demo Burger ni el banner de demostración
    const header = page.locator('header');
    await expect(header.getByText('Demo Burger')).not.toBeVisible();
    await expect(page.getByText('Entorno de demostración')).not.toBeVisible();
    await expect(page.getByText('3 zonas de entrega')).not.toBeVisible();

    // Verificar también en /registro
    await page.goto('/registro');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'OrderFlow SaaS para negocios' })).toBeVisible();
    await expect(header.getByText('Demo Burger')).not.toBeVisible();
    await expect(page.getByText('Entorno de demostración')).not.toBeVisible();
  });
});

