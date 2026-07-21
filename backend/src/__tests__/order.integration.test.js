import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const JWT_SECRET = 'test-jwt-secret-key-at-least-24-chars!!';

const mockAdmin = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@test.com',
  role: 'ADMIN',
  restaurantId: 'rest-1'
};

const mockRestaurant = {
  id: 'rest-1',
  slug: 'demo-burger',
  name: 'Demo Burger',
  config: {
    deliveryFee: 5000,
    coupons: [],
    deliveryZones: [],
    loyaltyProgram: null,
    acceptsScheduledOrders: false
  }
};

const mockProduct = {
  id: 'prod-1',
  name: 'Clasica',
  price: 12000,
  isAvailable: true,
  trackStock: false,
  stock: 50,
  restaurantId: 'rest-1'
};

const mockCustomer = {
  id: 'cust-1',
  name: 'Cliente Test',
  phone: '3001234567',
  email: 'cliente@test.com',
  address: 'Calle 123',
  points: 0,
  tier: 'BRONCE'
};

const mockOrder = {
  id: 'order-1',
  orderNumber: 1,
  restaurantId: 'rest-1',
  customerId: 'cust-1',
  customerName: 'Cliente Test',
  customerPhone: '3001234567',
  customerEmail: 'cliente@test.com',
  customerAddress: 'Calle 123',
  deliveryZoneName: null,
  notes: null,
  paymentMethod: 'CASH',
  paymentStatus: 'APPROVED',
  subtotal: 12000,
  deliveryFeeApplied: 0,
  discountAmount: 0,
  pointsRedeemed: 0,
  couponCode: null,
  wompiTransactionId: null,
  tableNumber: null,
  total: 12000,
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'item-1',
      orderId: 'order-1',
      productId: 'prod-1',
      quantity: 1,
      unitPrice: 12000,
      subtotal: 12000,
      product: mockProduct
    }
  ]
};

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn()
  },
  restaurant: {
    findUnique: vi.fn(),
    findFirst: vi.fn()
  },
  product: {
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn()
  },
  customer: {
    upsert: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn()
  },
  order: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn()
  },
  orderCounter: {
    upsert: vi.fn(),
    update: vi.fn()
  },
  restaurantConfig: {
    findUnique: vi.fn()
  },
  $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  $transaction: vi.fn()
}));

vi.mock('../config/prisma.js', () => ({
  prisma: mockPrisma
}));

vi.mock('../services/socket.service.js', () => ({
  emitNewOrder: vi.fn(),
  emitOrderStatusChanged: vi.fn(),
  initSocket: vi.fn(),
  getIO: vi.fn()
}));

vi.mock('../services/email.service.js', () => ({
  sendOrderConfirmationEmail: vi.fn(),
  sendOrderStatusEmail: vi.fn(),
  sendWelcomeEmail: vi.fn()
}));

vi.mock('../services/whatsapp.service.js', () => ({
  sendStatusUpdate: vi.fn()
}));

vi.mock('../services/maps.service.js', () => ({
  isAddressInZone: vi.fn().mockResolvedValue(null),
  getDistanceFromRestaurant: vi.fn()
}));

import { app } from '../app.js';

function adminCookie() {
  const token = jwt.sign(
    { sub: mockAdmin.id, role: mockAdmin.role, restaurantId: mockAdmin.restaurantId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `ff_token=${token}`;
}

describe('Order Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
  });

  describe('POST /api/orders', () => {
    it('creates a new order with valid data', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
      mockPrisma.customer.upsert.mockResolvedValue(mockCustomer);
      mockPrisma.orderCounter.upsert.mockResolvedValue({ lastOrderNumber: 0 });
      mockPrisma.orderCounter.update.mockResolvedValue({ lastOrderNumber: 1 });
      mockPrisma.order.create.mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            name: 'Cliente Test',
            phone: '3001234567',
            email: 'cliente@test.com',
            address: 'Calle 123'
          },
          items: [{ productId: 'prod-1', quantity: 1 }],
          paymentMethod: 'CASH'
        });

      expect(res.status).toBe(201);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.id).toBe('order-1');
      expect(res.body.order.total).toBe(12000);
      expect(res.body.order.items).toHaveLength(1);
    });

    it('returns 422 for empty items array', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            name: 'Cliente Test',
            phone: '3001234567'
          },
          items: [],
          paymentMethod: 'CASH'
        });

      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Datos invalidos');
    });

    it('returns 422 for missing customer name', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            name: 'A',
            phone: '3001234567'
          },
          items: [{ productId: 'prod-1', quantity: 1 }],
          paymentMethod: 'CASH'
        });

      expect(res.status).toBe(422);
    });

    it('returns 400 for insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, trackStock: true, stock: 2 };

      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findMany.mockResolvedValue([lowStockProduct]);
      mockPrisma.customer.upsert.mockResolvedValue(mockCustomer);

      const res = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            name: 'Cliente Test',
            phone: '3001234567',
            email: 'cliente@test.com'
          },
          items: [{ productId: 'prod-1', quantity: 5 }],
          paymentMethod: 'CASH'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Stock insuficiente/i);
    });
  });

  describe('GET /api/orders/admin', () => {
    it('returns paginated orders for admin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.order.findMany.mockResolvedValue([mockOrder]);
      mockPrisma.order.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/orders/admin')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/orders/admin');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('updates order status', async () => {
      const updatedOrder = { ...mockOrder, status: 'PREPARING' };

      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(updatedOrder);

      const res = await request(app)
        .patch('/api/orders/order-1/status')
        .set('Cookie', adminCookie())
        .send({ status: 'PREPARING' });

      expect(res.status).toBe(200);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.status).toBe('PREPARING');
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/orders/order-1/status')
        .send({ status: 'PREPARING' });

      expect(res.status).toBe(401);
    });
  });
});
