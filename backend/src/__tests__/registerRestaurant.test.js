import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  restaurant: {
    findUnique: vi.fn(),
    create: vi.fn()
  },
  restaurantConfig: {
    create: vi.fn()
  },
  orderCounter: {
    create: vi.fn()
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn()
  },
  $transaction: vi.fn()
}));

vi.mock('../config/prisma.js', () => ({
  prisma: mockPrisma
}));

vi.mock('../services/email.service.js', () => ({
  sendWelcomeEmail: vi.fn()
}));

vi.mock('../utils/token.js', () => ({
  signToken: vi.fn().mockReturnValue('mock-jwt-token'),
  signRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
  verifyRefreshToken: vi.fn()
}));

import { registerRestaurant } from '../services/auth.service.js';

describe('Auth Service - registerRestaurant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
  });

  it('successfully registers a new restaurant with admin user and config', async () => {
    mockPrisma.restaurant.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const mockCreatedRestaurant = {
      id: 'rest-123',
      name: 'Pizzería Napoli',
      slug: 'napoli-pizza',
      phone: '3009876543',
      email: 'admin@napoli.com'
    };

    const mockCreatedUser = {
      id: 'user-123',
      name: 'Mario Rossi',
      email: 'admin@napoli.com',
      role: 'ADMIN',
      restaurantId: 'rest-123'
    };

    mockPrisma.restaurant.create.mockResolvedValue(mockCreatedRestaurant);
    mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

    const result = await registerRestaurant({
      restaurantName: 'Pizzería Napoli',
      slug: 'napoli-pizza',
      phone: '3009876543',
      adminName: 'Mario Rossi',
      email: 'admin@napoli.com',
      password: 'SecurePassword123!'
    });

    expect(result.restaurant).toEqual({
      id: 'rest-123',
      name: 'Pizzería Napoli',
      slug: 'napoli-pizza'
    });
    expect(result.user.role).toBe('ADMIN');
    expect(result.token).toBe('mock-jwt-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(mockPrisma.restaurant.create).toHaveBeenCalled();
    expect(mockPrisma.restaurantConfig.create).toHaveBeenCalled();
    expect(mockPrisma.orderCounter.create).toHaveBeenCalled();
  });

  it('throws 409 if restaurant slug is already taken', async () => {
    mockPrisma.restaurant.findUnique.mockResolvedValue({ id: 'existing-id', slug: 'napoli-pizza' });

    await expect(
      registerRestaurant({
        restaurantName: 'Pizzería Napoli',
        slug: 'napoli-pizza',
        phone: '3009876543',
        adminName: 'Mario Rossi',
        email: 'admin@napoli.com',
        password: 'SecurePassword123!'
      })
    ).rejects.toThrow('El enlace (slug) ya está en uso por otro restaurante');
  });

  it('throws 409 if admin email is already registered', async () => {
    mockPrisma.restaurant.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user', email: 'admin@napoli.com' });

    await expect(
      registerRestaurant({
        restaurantName: 'Pizzería Napoli',
        slug: 'napoli-pizza',
        phone: '3009876543',
        adminName: 'Mario Rossi',
        email: 'admin@napoli.com',
        password: 'SecurePassword123!'
      })
    ).rejects.toThrow('Ya existe una cuenta registrada con este correo');
  });
});
