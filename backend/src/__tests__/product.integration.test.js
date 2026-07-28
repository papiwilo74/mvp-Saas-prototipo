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

const mockCategory = {
  id: 'cat-1',
  name: 'Hamburguesas',
  sortOrder: 1,
  restaurantId: 'rest-1'
};

const mockProduct = {
  id: 'prod-1',
  name: 'Clasica',
  description: 'Carne, queso, lechuga',
  price: 12000,
  imageUrl: null,
  isAvailable: true,
  trackStock: false,
  stock: null,
  isCombo: false,
  comboItems: [],
  variants: null,
  isDeleted: false,
  restaurantId: 'rest-1',
  categoryId: 'cat-1',
  category: mockCategory,
  images: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  product: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn()
  },
  category: { findMany: vi.fn() },
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

describe('Product CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
  });

  describe('GET /api/products', () => {
    it('returns paginated products for admin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
      mockPrisma.product.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/products')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe('Clasica');
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });

    it('respects pagination params', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/products?page=1&pageSize=5')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(200);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 5 })
      );
    });

    it('returns 401 without auth cookie', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/products', () => {
    it('creates a new product', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie())
        .send({
          name: 'Clasica',
          description: 'Carne, queso, lechuga',
          price: 12000,
          categoryId: 'cat-1'
        });

      expect(res.status).toBe(201);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.name).toBe('Clasica');
    });

    it('rejects product with short name', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie())
        .send({
          name: 'X',
          description: 'Desc',
          price: 10000,
          categoryId: 'cat-1'
        });

      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Datos invalidos');
    });

    it('rejects product with negative price', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie())
        .send({
          name: 'Test',
          description: 'Descripcion valida',
          price: -100,
          categoryId: 'cat-1'
        });

      expect(res.status).toBe(422);
    });

    it('rejects product without category', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie())
        .send({
          name: 'Test',
          description: 'Descripcion valida',
          price: 10000
        });

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('updates an existing product', async () => {
      const updated = { ...mockProduct, name: 'Clasica 2.0', price: 15000 };

      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.product.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/products/prod-1')
        .set('Cookie', adminCookie())
        .send({ name: 'Clasica 2.0', price: 15000 });

      expect(res.status).toBe(200);
      expect(res.body.product.name).toBe('Clasica 2.0');
    });

    it('returns 404 for non-existent product', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/products/nonexistent')
        .set('Cookie', adminCookie())
        .send({ name: 'Nuevo nombre' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('soft-deletes a product', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.product.update.mockResolvedValue({ ...mockProduct, isDeleted: true });

      const res = await request(app)
        .delete('/api/products/prod-1')
        .set('Cookie', adminCookie());

      expect(res.status).toBe(204);

      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: expect.objectContaining({ isDeleted: true })
        })
      );
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).delete('/api/products/prod-1');
      expect(res.status).toBe(401);
    });
  });
});
