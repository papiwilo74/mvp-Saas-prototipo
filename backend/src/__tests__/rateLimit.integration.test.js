import { describe, it, expect, vi, beforeEach } from 'vitest';
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

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  restaurant: { findFirst: vi.fn(), findUnique: vi.fn() },
  product: { findMany: vi.fn(), count: vi.fn() },
  customer: { findMany: vi.fn(), upsert: vi.fn(), findFirst: vi.fn(), create: vi.fn(), count: vi.fn() },
  order: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn(), groupBy: vi.fn() },
  orderCounter: { upsert: vi.fn(), update: vi.fn() },
  restaurantConfig: { findUnique: vi.fn() },
  category: { findMany: vi.fn() },
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

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
    mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
  });

  it('blocks requests after exceeding global rate limit', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);

    for (let i = 0; i < 100; i++) {
      await request(app)
        .get('/api/products')
        .set('Cookie', adminCookie());
    }

    const res = await request(app)
      .get('/api/products')
      .set('Cookie', adminCookie());

    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/Demasiadas solicitudes/i);
  });
});
