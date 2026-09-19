import { test, expect } from '@playwright/test';
import crypto from 'crypto';

const CSRF_TOKEN = crypto.randomBytes(32).toString('hex');

const RESTAURANT_CONFIG = {
  id: 'rest-1',
  restaurantId: 'rest-1',
  restaurantName: 'Demo Burger',
  logoUrl: null,
  primaryColor: '#ea580c',
  secondaryColor: '#18181b',
  deliveryFee: 5000,
  paymentMethods: ['CASH', 'NEQUI', 'CARD'],
  deliveryZones: [
    { name: 'Norte', fee: 5000, estimatedMinutes: 30, isActive: true },
    { name: 'Sur', fee: 8000, estimatedMinutes: 45, isActive: true },
  ],
  coupons: [{ code: 'BIENVENIDA10', discountType: 'PERCENTAGE', discountValue: 10, isActive: true }],
  openingHours: 'Lun-Sab 10:00-22:00',
  wompiPublicKey: null,
  whatsapp: '+573001234567',
  phone: '+573001234567',
  googleMapsApiKey: null,
  acceptsScheduledOrders: false,
  loyaltyProgram: { enabled: false },
};

const MENU_RESPONSE = {
  restaurant: {
    id: 'rest-1',
    name: 'Demo Burger',
    slug: 'demo-burger',
    config: RESTAURANT_CONFIG,
    categories: [
      {
        id: 'cat-1',
        name: 'Hamburguesas',
        description: '',
        sortOrder: 1,
        products: [
          { id: 'prod-1', name: 'Clasica', description: 'Carne 150g, queso, lechuga, tomate', price: 15000, imageUrl: null, isAvailable: true, trackStock: false, stock: null, isCombo: false, categoryId: 'cat-1', variants: [] },
          { id: 'prod-2', name: 'Doble Carne', description: 'Doble carne 300g, queso, bacon', price: 22000, imageUrl: null, isAvailable: true, trackStock: false, stock: null, isCombo: false, categoryId: 'cat-1', variants: [] },
        ],
      },
      {
        id: 'cat-2',
        name: 'Bebidas',
        description: '',
        sortOrder: 2,
        products: [
          { id: 'prod-3', name: 'Gaseosa', description: 'Lata 355ml', price: 3000, imageUrl: null, isAvailable: true, trackStock: false, stock: null, isCombo: false, categoryId: 'cat-2', variants: [] },
        ],
      },
    ],
  },
};

const PENDING_ORDER = {
  id: 'order-1',
  orderNumber: 42,
  status: 'PENDING',
  paymentMethod: 'CASH',
  subtotal: 15000,
  deliveryFeeApplied: 5000,
  discountAmount: 0,
  pointsRedeemed: 0,
  total: 20000,
  customerName: 'Juan Perez',
  customerPhone: '3001234567',
  customerEmail: '',
  customerAddress: 'Calle 123 #45-67',
  deliveryZoneName: 'Norte',
  couponCode: null,
  scheduledFor: null,
  notes: '',
  createdAt: new Date().toISOString(),
  items: [{ id: 'oi-1', productId: 'prod-1', quantity: 1, unitPrice: 15000, subtotal: 15000, product: { id: 'prod-1', name: 'Clasica' } }],
};

const ADMIN_USER = { id: 'admin-1', name: 'Admin', email: 'admin@demo.com', role: 'ADMIN', restaurantId: 'rest-1', restaurantSlug: 'demo-burger' };

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

test.describe('Flujo cliente: menu → carrito → checkout → admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: 'csrf-token', value: CSRF_TOKEN, domain: 'localhost', path: '/' },
    ]);
  });

  test('completa pedido como invitado y administrador lo gestiona', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    let receivedOrderPayload = null;

    // ── Global API routes for the test ──
    await page.route(/\/api\/restaurant-config/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RESTAURANT_CONFIG), headers: mockHeaders() });
    });

    await page.route(/\/api\/menu/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MENU_RESPONSE), headers: mockHeaders() });
    });

    await page.route(/\/api\/orders(?:\?.*)?$/, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        try {
          receivedOrderPayload = JSON.parse(request.postData() || '{}');
        } catch {}
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ order: PENDING_ORDER, earnedPoints: 0, warnings: [] }),
          headers: mockHeaders(),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
          headers: mockHeaders(),
        });
      }
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: ADMIN_USER }), headers: mockHeaders() });
    });

    await page.route(/\/api\/orders\/admin/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ orders: [PENDING_ORDER], total: 1, page: 1, pageSize: 20, pagination: { page: 1, totalPages: 1, pageSize: 20 } }),
        headers: mockHeaders(),
      });
    });

    await page.route(/\/api\/orders\/.*\/status/, async (route) => {
      const updated = { ...PENDING_ORDER, status: 'PREPARING' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ order: updated }), headers: mockHeaders() });
    });

    // ── 1. Menu page: browse and add product to cart ──
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText(/Menú|Menu/);
    await expect(page.getByRole('link', { name: 'Clasica', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Doble Carne', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Gaseosa', exact: true })).toBeVisible();

    await page.locator('button[aria-label="Agregar"]').first().click();
    await expect(page.getByText('agregado al carrito')).toBeVisible();

    // ── 2. Cart page: fill customer info and place order ──
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('pedido esta casi listo');
    await expect(page.getByRole('heading', { name: 'Clasica' })).toBeVisible();

    await page.fill('input[name="customerName"]', 'Juan Perez');
    await page.fill('input[placeholder="3001234567"]', '3001234567');
    await page.selectOption('select', 'PICKUP');

    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await page.waitForURL('**/checkout/success**');
    await page.waitForLoadState('networkidle');

    expect(receivedOrderPayload).toBeTruthy();
    expect(receivedOrderPayload.customer.name).toBe('Juan Perez');
    expect(receivedOrderPayload.customer.phone).toBe('3001234567');
    expect(receivedOrderPayload.items).toHaveLength(1);

    // ── 3. Success page: verify order confirmation ──
    await expect(page.getByText('#42')).toBeVisible();
    await expect(page.getByText(/20\.000/)).toBeVisible();

    // ── 4. Admin flow: login, view orders, update status ──
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Should redirect to /admin
    await page.waitForURL('**/admin**');
    await page.waitForLoadState('networkidle');

    // Navigate to admin orders
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('#42')).toBeVisible();
    await expect(page.getByText('Juan Perez')).toBeVisible();
    await expect(page.getByText(/20\.000/)).toBeVisible();
  });
});
