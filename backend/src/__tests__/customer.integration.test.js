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

const mockCustomer = {
  id: 'cust-1',
  name: 'Juan Perez',
  phone: '3001234567',
  email: 'juan@test.com',
  address: 'Calle 123',
  notes: null,
  points: 0,
  tier: 'BRONCE',
  restaurantId: 'rest-1',
  _count: { orders: 3 },
  orders: [
    {
      id: 'order-1',
      orderNumber: 5,
      total: 45000,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
      items: [
        { id: 'item-1', product: { name: 'Clasica', price: 12000 } }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  customer: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn()
  },
  order: { groupBy: vi.fn() },
  restaurant: { findUnique: vi.fn() },
  $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  $transaction: vi.fn()
}));

vi.mock('../config/prisma.js', () => ({ prisma: mockPrisma }));

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

import { app } from '../app.js';

function adminCookie() {
  const token = jwt.sign(
    { sub: mockAdmin.id, role: mockAdmin.role, restaurantId: mockAdmin.restaurantId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `ff_token=${token}`;
}

describe('Customer Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
  });

  describe('GET /api/customers', () => {
    it('returns paginated customers with total spent', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.customer.findMany.mockResolvedValue([mockCustomer]);
      mockPrisma.customer.count.mockResolvedValue(1);
      mockPrisma.order.groupBy.mockResolvedValue([{ customerId: 'cust-1', _sum: { total: 135000 } }]);

      const res = await request(app)
        .get('/api/customers')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(200);
      expect(res.body.customers).toHaveLength(1);
      expect(res.body.customers[0].name).toBe('Juan Perez');
      expect(res.body.customers[0].totalSpent).toBe(135000);
      expect(res.body.pagination).toBeDefined();
    });

    it('searches customers by name', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.customer.findMany.mockResolvedValue([mockCustomer]);
      mockPrisma.customer.count.mockResolvedValue(1);
      mockPrisma.order.groupBy.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/customers?search=juan')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(200);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: 'juan' }) })
            ])
          })
        })
      );
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/customers/:id', () => {
    it('returns customer detail with order history', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);

      const res = await request(app)
        .get('/api/customers/cust-1')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(200);
      expect(res.body.customer).toBeDefined();
      expect(res.body.customer.name).toBe('Juan Perez');
      expect(res.body.customer.orders).toHaveLength(1);
    });

    it('returns 404 for non-existent customer', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/customers/nonexistent')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/customers/:id/notes', () => {
    it('updates customer notes', async () => {
      const updatedCustomer = { ...mockCustomer, notes: 'Cliente frecuente' };

      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);
      mockPrisma.customer.update.mockResolvedValue(updatedCustomer);

      const res = await request(app)
        .patch('/api/customers/cust-1/notes')
        .set('Cookie', adminCookie())
        .send({ notes: 'Cliente frecuente' });

      expect(res.status).toBe(200);
      expect(res.body.customer.notes).toBe('Cliente frecuente');
    });

    it('returns 404 when customer does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/customers/nonexistent/notes')
        .set('Cookie', adminCookie())
        .send({ notes: 'Nota' });

      expect(res.status).toBe(404);
    });
  });
});
