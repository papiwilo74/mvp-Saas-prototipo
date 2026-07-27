import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

vi.mock('../config/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn()
    },
    restaurant: {
      findUnique: vi.fn(),
      findFirst: vi.fn()
    }
  };
  return { prisma: mockPrisma };
});

vi.mock('../services/email.service.js', () => ({ sendWelcomeEmail: vi.fn() }));
vi.mock('../services/socket.service.js', () => ({ emitToRestaurant: vi.fn() }));

const mockPrisma = (await import('../config/prisma.js')).prisma;

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user successfully', async () => {
    mockPrisma.restaurant.findFirst.mockResolvedValue({ id: 'rest-1', slug: 'demo-burger' });
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'CUSTOMER',
      restaurantId: 'rest-1'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.name).toBe('Test User');
  });

  it('returns 422 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(422);
  });

  it('returns 422 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123' });

    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(422);
  });
});
