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

const mockConfig = {
  id: 'cfg-1',
  restaurantName: 'Demo Burger',
  logoUrl: '',
  heroImageUrl: '',
  primaryColor: '#ea580c',
  secondaryColor: '#18181b',
  phone: '+57 300 000 0000',
  whatsapp: '+573000000000',
  address: 'Calle Principal 123',
  email: 'hola@demoburger.com',
  facebookUrl: '',
  instagramUrl: '',
  openingHours: 'Lunes a domingo: 11:00-22:00',
  businessHours: null,
  acceptsScheduledOrders: false,
  leadTimeMinutes: 30,
  deliveryFee: 0,
  deliveryZones: [],
  coupons: [],
  paymentMethods: ['CASH', 'NEQUI', 'CARD'],
  wompiPublicKey: '',
  wompiPrivateKey: '',
  whatsappToken: '',
  whatsappPhoneNumberId: '',
  googleMapsApiKey: '',
  loyaltyProgram: null
};

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  restaurant: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn()
  },
  restaurantConfig: {
    upsert: vi.fn()
  },
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

describe('Restaurant Config API', () => {
  describe('GET /api/restaurant-config', () => {
    it('returns public config', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue({
        id: 'rest-1',
        slug: 'demo-burger',
        config: mockConfig
      });

      const res = await request(app)
        .get('/api/restaurant-config')
        .query({ restaurant: 'demo-burger' });

      expect(res.status).toBe(200);
      expect(res.body.restaurant.config.restaurantName).toBe('Demo Burger');
      expect(res.body.restaurant.config).not.toHaveProperty('wompiPrivateKey');
    });

    it('returns 404 for nonexistent restaurant', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/restaurant-config')
        .query({ restaurant: 'nonexistent' });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/restaurant-config', () => {
    it('updates config', async () => {
      mockPrisma.restaurant.findFirst.mockResolvedValue({
        id: 'rest-1',
        config: mockConfig
      });
      mockPrisma.restaurantConfig.upsert.mockResolvedValue({
        ...mockConfig,
        restaurantName: 'Updated Burger'
      });
      mockPrisma.restaurant.update.mockResolvedValue({
        id: 'rest-1',
        slug: 'demo-burger',
        config: { ...mockConfig, restaurantName: 'Updated Burger' }
      });

      const res = await request(app)
        .put('/api/restaurant-config')
        .set('Cookie', adminCookie())
        .set('Authorization', authHeader())
        .set('x-csrf-token', 'test')
        .send({ restaurantName: 'Updated Burger', primaryColor: '#000000', secondaryColor: '#ffffff' });

      expect(res.status).toBe(200);
      expect(res.body.config.restaurantName).toBe('Updated Burger');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .put('/api/restaurant-config')
        .send({ restaurantName: 'Test' });

      expect(res.status).toBe(401);
    });
  });
});
