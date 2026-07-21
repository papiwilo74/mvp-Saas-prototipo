import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const mockRestaurantData = {
  id: 'rest-1',
  name: 'Demo Burger',
  slug: 'demo-burger',
  config: {
    name: 'Demo Burger',
    primaryColor: '#ea580c',
    deliveryFee: 5000
  },
  categories: [
    {
      id: 'cat-1',
      name: 'Hamburguesas',
      sortOrder: 1,
      products: [
        {
          id: 'prod-1',
          name: 'Clasica',
          description: 'Carne, queso, lechuga',
          price: 12000,
          isAvailable: true,
          isDeleted: false,
          trackStock: false,
          stock: 50,
          images: [
            { id: 'img-1', url: '/uploads/burger1.jpg', sortOrder: 1 }
          ]
        },
        {
          id: 'prod-2',
          name: 'Doble Carne',
          description: 'Doble carne, doble queso',
          price: 18000,
          isAvailable: true,
          isDeleted: false,
          trackStock: false,
          stock: 30,
          images: []
        }
      ]
    },
    {
      id: 'cat-2',
      name: 'Bebidas',
      sortOrder: 2,
      products: [
        {
          id: 'prod-3',
          name: 'Coca-Cola',
          description: '500ml',
          price: 4000,
          isAvailable: true,
          isDeleted: false,
          trackStock: true,
          stock: 20,
          images: []
        }
      ]
    }
  ]
};

const mockPrisma = vi.hoisted(() => ({
  restaurant: {
    findUnique: vi.fn(),
    findFirst: vi.fn()
  },
  product: {
    findMany: vi.fn(),
    count: vi.fn()
  },
  $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  $transaction: vi.fn()
}));

vi.mock('../config/prisma.js', () => ({
  prisma: mockPrisma
}));

import { app } from '../app.js';

describe('Menu Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
  });

  describe('GET /api/menu', () => {
    it('returns categories with products for a valid restaurant slug', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurantData);

      const res = await request(app)
        .get('/api/menu')
        .query({ restaurant: 'demo-burger' });

      expect(res.status).toBe(200);
      expect(res.body.restaurant).toBeDefined();
      expect(res.body.restaurant.slug).toBe('demo-burger');
      expect(res.body.restaurant.categories).toHaveLength(2);
      expect(res.body.restaurant.categories[0].products).toHaveLength(2);
    });

    it('filters products when search query is provided', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurantData);

      const res = await request(app)
        .get('/api/menu')
        .query({ restaurant: 'demo-burger', search: 'burger' });

      expect(res.status).toBe(200);
      expect(res.body.restaurant).toBeDefined();
      expect(mockPrisma.restaurant.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'demo-burger' },
          include: expect.objectContaining({
            categories: expect.objectContaining({
              include: expect.objectContaining({
                products: expect.objectContaining({
                  where: expect.objectContaining({
                    isAvailable: true,
                    isDeleted: false,
                    OR: expect.any(Array)
                  })
                })
              })
            })
          })
        })
      );
    });

    it('returns 404 for non-existent restaurant slug', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/menu')
        .query({ restaurant: 'nonexistent' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Restaurante no encontrado');
    });
  });

  describe('Response structure', () => {
    it('has correct restaurant structure', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurantData);

      const res = await request(app)
        .get('/api/menu')
        .query({ restaurant: 'demo-burger' });

      expect(res.status).toBe(200);

      const { restaurant } = res.body;
      expect(restaurant).toHaveProperty('id');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('slug');
      expect(restaurant).toHaveProperty('config');
      expect(restaurant).toHaveProperty('categories');

      const category = restaurant.categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('products');

      const product = category.products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('images');
    });
  });
});
