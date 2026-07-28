import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const JWT_SECRET = 'test-jwt-secret-key-at-least-24-chars!!';

const mockSuperAdmin = {
  id: 'super-1',
  name: 'Super Admin',
  email: 'super@test.com',
  role: 'SUPERADMIN',
  restaurantId: null
};

const mockAdmin = {
  id: 'admin-1',
  name: 'Regular Admin',
  email: 'admin@test.com',
  role: 'ADMIN',
  restaurantId: 'rest-1'
};

const mockRestaurant = {
  id: 'rest-1',
  name: 'Demo Burger',
  slug: 'demo-burger',
  email: 'info@demoburger.com',
  phone: '3000000000',
  address: 'Calle 1',
  createdAt: new Date().toISOString(),
  config: {
    id: 'cfg-1',
    restaurantName: 'Demo Burger',
    primaryColor: '#ea580c',
    whatsapp: '3000000000'
  },
  _count: { orders: 50, products: 12, categories: 3 }
};

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
  restaurant: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn()
  },
  restaurantConfig: { create: vi.fn() },
  order: {
    count: vi.fn(),
    findMany: vi.fn()
  },
  product: { count: vi.fn() },
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

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('$2a$10$hashed'), compare: vi.fn() }
}));

import { app } from '../app.js';

function superAdminCookie() {
  const token = jwt.sign(
    { sub: mockSuperAdmin.id, role: mockSuperAdmin.role, restaurantId: mockSuperAdmin.restaurantId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `ff_token=${token}`;
}

function adminCookie() {
  const token = jwt.sign(
    { sub: mockAdmin.id, role: mockAdmin.role, restaurantId: mockAdmin.restaurantId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `ff_token=${token}`;
}

describe('Superadmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
  });

  describe('GET /api/superadmin/stats', () => {
    it('returns global stats for superadmin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockSuperAdmin);
      mockPrisma.restaurant.count.mockResolvedValue(5);
      mockPrisma.order.count.mockResolvedValue(500);
      mockPrisma.product.count.mockResolvedValue(100);
      mockPrisma.order.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/superadmin/stats')
        .set('Cookie', superAdminCookie());

      expect(res.status).toBe(200);
      expect(res.body.totalRestaurants).toBe(5);
      expect(res.body.totalOrders).toBe(500);
      expect(res.body.totalProducts).toBe(100);
    });

    it('blocks regular admin from stats', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .get('/api/superadmin/stats')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(403);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/superadmin/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/superadmin/restaurants', () => {
    it('lists all restaurants for superadmin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockSuperAdmin);
      mockPrisma.restaurant.findMany.mockResolvedValue([mockRestaurant]);

      const res = await request(app)
        .get('/api/superadmin/restaurants')
        .set('Cookie', superAdminCookie());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.restaurants)).toBe(true);
      expect(res.body.restaurants).toHaveLength(1);
      expect(res.body.restaurants[0].name).toBe('Demo Burger');
    });
  });

  describe('GET /api/superadmin/restaurants/:id', () => {
    it('returns restaurant detail with categories', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockSuperAdmin);
      mockPrisma.restaurant.findUnique.mockResolvedValue({
        ...mockRestaurant,
        categories: [],
        _count: { orders: 50, products: 12 }
      });

      const res = await request(app)
        .get('/api/superadmin/restaurants/rest-1')
        .set('Cookie', superAdminCookie());

      expect(res.status).toBe(200);
      expect(res.body.restaurant.name).toBe('Demo Burger');
    });

    it('returns 404 for non-existent restaurant', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockSuperAdmin);
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/superadmin/restaurants/nonexistent')
        .set('Cookie', superAdminCookie());

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/superadmin/restaurants', () => {
    it('creates a new restaurant with admin user', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockSuperAdmin)
        .mockResolvedValue(null);

      mockPrisma.restaurant.findUnique.mockResolvedValue(null);
      mockPrisma.restaurant.create.mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .post('/api/superadmin/restaurants')
        .set('Cookie', superAdminCookie())
        .send({
          name: 'Demo Burger',
          slug: 'demo-burger',
          adminEmail: 'admin@demoburger.com',
          adminPassword: 'SecurePass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.restaurant).toBeDefined();
    });

    it('rejects duplicate slug', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockSuperAdmin);

      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .post('/api/superadmin/restaurants')
        .set('Cookie', superAdminCookie())
        .send({
          name: 'Demo Burger 2',
          slug: 'demo-burger',
          adminEmail: 'admin2@demoburger.com',
          adminPassword: 'SecurePass123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/slug/i);
    });

    it('rejects invalid slug format', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockSuperAdmin);

      const res = await request(app)
        .post('/api/superadmin/restaurants')
        .set('Cookie', superAdminCookie())
        .send({
          name: 'Test',
          slug: 'INVALID SLUG!!!',
          adminEmail: 'admin@test.com',
          adminPassword: 'SecurePass123!'
        });

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/superadmin/restaurants/:id', () => {
    it('updates restaurant details', async () => {
      const updated = { ...mockRestaurant, name: 'Demo Burger Premium' };

      mockPrisma.user.findUnique.mockResolvedValue(mockSuperAdmin);
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.restaurant.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/superadmin/restaurants/rest-1')
        .set('Cookie', superAdminCookie())
        .send({ name: 'Demo Burger Premium' });

      expect(res.status).toBe(200);
      expect(res.body.restaurant.name).toBe('Demo Burger Premium');
    });
  });
});
