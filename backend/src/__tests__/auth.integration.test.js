import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const JWT_SECRET = 'test-jwt-secret-key-at-least-24-chars!!';

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: '$2a$10$hashedpassword',
  role: 'ADMIN',
  restaurantId: 'rest-1'
};

const mockBcrypt = vi.hoisted(() => ({
  compare: vi.fn(),
  hash: vi.fn()
}));

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn()
  },
  restaurant: {
    findFirst: vi.fn(),
    findUnique: vi.fn()
  },
  $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  $transaction: vi.fn()
}));

vi.mock('bcryptjs', () => ({
  default: mockBcrypt
}));

vi.mock('../config/prisma.js', () => ({
  prisma: mockPrisma
}));

import { app } from '../app.js';

describe('Auth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
  });

  describe('POST /api/auth/login', () => {
    it('returns user and sets token cookie with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'correct-password' });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe('user-1');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user).not.toHaveProperty('passwordHash');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith('ff_token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/HttpOnly/);
    });

    it('returns 401 for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'whatever' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Credenciales invalidas');
    });

    it('returns 401 for invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Credenciales invalidas');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user with valid token cookie', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const token = jwt.sign(
        { sub: mockUser.id, role: mockUser.role, restaurantId: mockUser.restaurantId },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `ff_token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe('user-1');
    });

    it('returns 401 without token cookie', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token requerido');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears the token cookie', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Sesion cerrada');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith('ff_token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/ff_token=;/);
    });
  });

  describe('Rate limiting', () => {
    it('blocks too many login attempts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const payload = { email: 'test@example.com', password: 'correct-password' };

      const res = await request(app).post('/api/auth/login').send(payload);

      expect(res.status).toBe(429);
      expect(res.body.message).toMatch(/Demasiadas solicitudes/i);
    });
  });
});
