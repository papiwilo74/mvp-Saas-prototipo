import { test, expect } from '@playwright/test';
import crypto from 'crypto';

const CSRF_TOKEN = crypto.randomBytes(32).toString('hex');
const ADMIN_USER = { id: 'admin-1', name: 'Admin', email: 'admin@demo.com', role: 'ADMIN', restaurantId: 'rest-1' };
const SUPER_ADMIN_USER = { id: 'sa-1', name: 'Super Admin', email: 'super@admin.com', role: 'SUPER_ADMIN', restaurantId: null };

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
  return { 'set-cookie': `csrf-token=${CSRF_TOKEN}; Path=/` };
}

test.describe('Flujo administrador: login, gestion de pedidos y superadmin', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: 'csrf-token', value: CSRF_TOKEN, domain: 'localhost', path: '/' },
    ]);
  });

  test('admin filtra y cambia estado de pedidos', async ({ page }) => {
    const orders = [
      mockOrder('order-1', 41, 'PENDING'),
      mockOrder('order-2', 42, 'PREPARING'),
      mockOrder('order-3', 43, 'DELIVERED'),
    ];

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ user: ADMIN_USER }),
        headers: { 'set-cookie': `ff_token=admin-jwt; Path=/; HttpOnly; SameSite=Lax, csrf-token=${CSRF_TOKEN}; Path=/` },
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ user: ADMIN_USER }), headers: mockHeaders() });
    });

    let lastStatusFilter = '';

    await page.route('**/api/orders/admin**', async (route) => {
      const url = new URL(route.request().url());
      const statusFilter = url.searchParams.get('status') || '';
      lastStatusFilter = statusFilter;
      const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ orders: filtered, total: filtered.length, page: 1, pageSize: 20, pagination: { page: 1, totalPages: 1, pageSize: 20 } }),
        headers: mockHeaders(),
      });
    });

    await page.route('**/api/orders/*/status', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      const updated = { ...orders[0], status: body.status };
      await route.fulfill({ status: 200, body: JSON.stringify({ order: updated }), headers: mockHeaders() });
    });

    await page.route('**/api/restaurant-config**', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({}), headers: mockHeaders() });
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
    await expect(page.getByText('Pendiente')).toBeVisible();
    await expect(page.getByText('Preparando')).toBeVisible();
    await expect(page.getByText('Entregado')).toBeVisible();

    await page.selectOption('select:below(:text("Estado"))', 'PREPARING');
    await page.waitForTimeout(500);
    expect(lastStatusFilter).toBe('PREPARING');
    await expect(page.getByText('#42')).toBeVisible();
    await expect(page.getByText('#41')).not.toBeVisible();

    const statusSelect = page.locator('tr:has(> td:text("#41")) select');
    await statusSelect.selectOption('PREPARING');
    await expect(page.getByText('PREPARING')).toBeVisible();
  });

  test('superadmin ve lista de restaurantes', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ user: SUPER_ADMIN_USER }),
        headers: { 'set-cookie': `ff_token=sa-jwt; Path=/; HttpOnly; SameSite=Lax, csrf-token=${CSRF_TOKEN}; Path=/` },
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ user: SUPER_ADMIN_USER }), headers: mockHeaders() });
    });

    await page.route('**/api/superadmin/restaurants', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'rest-1', name: 'Demo Burger', slug: 'demo-burger', isActive: true, _count: { orders: 42, products: 15, staff: 5 } },
          { id: 'rest-2', name: 'Pizza Roma', slug: 'pizza-roma', isActive: true, _count: { orders: 28, products: 20, staff: 3 } },
        ]),
        headers: mockHeaders(),
      });
    });

    await page.route('**/api/superadmin/stats', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ totalRestaurants: 2, totalOrders: 70, totalRevenue: 8500000, totalCustomers: 45, totalStaff: 8 }),
        headers: mockHeaders(),
      });
    });

    await page.route('**/api/restaurant-config**', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({}), headers: mockHeaders() });
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'super@admin.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/admin**');

    await page.goto('/superadmin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Demo Burger')).toBeVisible();
    await expect(page.getByText('Pizza Roma')).toBeVisible();
    await expect(page.getByText('42')).toBeVisible();
    await expect(page.getByText('28')).toBeVisible();
  });
});
