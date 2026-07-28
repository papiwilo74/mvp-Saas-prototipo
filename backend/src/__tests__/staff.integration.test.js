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

const mockStaff = {
  id: 'staff-1',
  name: 'Juan',
  email: 'juan@test.com',
  phone: '3001234567',
  role: 'CASHIER',
  isActive: true,
  createdAt: new Date().toISOString()
};

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  staff: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
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
  return `token=${token}; Path=/; HttpOnly`;
}

function authHeader() {
  const token = jwt.sign(
    { sub: mockAdmin.id, role: mockAdmin.role, restaurantId: mockAdmin.restaurantId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `Bearer ${token}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
});

describe('Staff API', () => {
  describe('GET /api/staff', () => {
    it('returns staff list', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([mockStaff]);

      const res = await request(app)
        .get('/api/staff')
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockStaff]);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/staff');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/staff', () => {
    it('creates staff', async () => {
      const newStaff = { ...mockStaff, id: 'staff-2', name: 'Pedro', email: 'pedro@test.com', pin: '1234' };
      mockPrisma.staff.findFirst.mockResolvedValue(null);
      mockPrisma.staff.create.mockResolvedValue(newStaff);

      const res = await request(app)
        .post('/api/staff')
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test')
        .send({ name: 'Pedro', email: 'pedro@test.com', pin: '1234' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Pedro');
    });

    it('returns 422 with invalid data', async () => {
      const res = await request(app)
        .post('/api/staff')
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test')
        .send({ name: '' });

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/staff/:id', () => {
    it('updates staff', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue(mockStaff);
      mockPrisma.staff.update.mockResolvedValue({ ...mockStaff, name: 'Juan Updated' });

      const res = await request(app)
        .put(`/api/staff/${mockStaff.id}`)
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test')
        .send({ name: 'Juan Updated' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Juan Updated');
    });

    it('returns 404 for nonexistent staff', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/staff/nonexistent`)
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test')
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/staff/:id', () => {
    it('deletes staff', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue(mockStaff);
      mockPrisma.staff.delete.mockResolvedValue(mockStaff);

      const res = await request(app)
        .delete(`/api/staff/${mockStaff.id}`)
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test');

      expect(res.status).toBe(204);
    });

    it('returns 404 for nonexistent staff', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/staff/nonexistent`)
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/staff/verify-pin', () => {
    it('verifies pin and returns staff info', async () => {
      const bcrypt = await import('bcryptjs');
      const hashedPin = await bcrypt.hash('1234', 10);
      mockPrisma.staff.findFirst.mockResolvedValue({ ...mockStaff, pin: hashedPin });

      const res = await request(app)
        .post('/api/staff/verify-pin')
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test')
        .send({ email: 'juan@test.com', pin: '1234' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name');
    });
  });
});
