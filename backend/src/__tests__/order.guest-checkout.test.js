import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const mockRestaurant = {
  id: 'rest-1',
  slug: 'demo-burger',
  name: 'Demo Burger',
  config: {
    deliveryFee: 5000,
    coupons: [
      {
        id: 'cup-1',
        code: 'PROMO10',
        description: '10% de descuento',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumOrder: 20000,
        isActive: true
      },
      {
        id: 'cup-2',
        code: 'FIJO5000',
        description: '$5.000 de descuento',
        discountType: 'FIXED',
        discountValue: 5000,
        minimumOrder: 30000,
        isActive: true
      },
      {
        id: 'cup-inactive',
        code: 'INACTIVO',
        description: 'Cupón vencido',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        isActive: false
      }
    ],
    deliveryZones: [
      {
        id: 'zona-centro',
        name: 'Centro',
        fee: 3000,
        minOrder: 15000,
        isActive: true
      }
    ],
    loyaltyProgram: null,
    acceptsScheduledOrders: false
  }
};

const mockProduct = {
  id: 'prod-1',
  name: 'Burger Especial',
  price: 25000,
  isAvailable: true,
  trackStock: false,
  stock: 100,
  restaurantId: 'rest-1'
};

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn()
  },
  restaurant: {
    findUnique: vi.fn(),
    findFirst: vi.fn()
  },
  product: {
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn()
  },
  customer: {
    upsert: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn()
  },
  order: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn()
  },
  orderCounter: {
    upsert: vi.fn(),
    update: vi.fn()
  },
  restaurantConfig: {
    findUnique: vi.fn()
  },
  $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  $transaction: vi.fn()
}));

vi.mock('../config/prisma.js', () => ({
  prisma: mockPrisma
}));

const mockSocket = vi.hoisted(() => ({
  emitNewOrder: vi.fn(),
  emitOrderStatusChanged: vi.fn(),
  initSocket: vi.fn(),
  getIO: vi.fn()
}));

vi.mock('../services/socket.service.js', () => mockSocket);

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
  getDistanceFromRestaurant: vi.fn(),
  getRouteDistanceFromRestaurant: vi.fn().mockResolvedValue({ distanceKm: 2, durationMinutes: 10 })
}));

import { app } from '../app.js';

describe('Guest Checkout & Order Stability Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
    mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
    mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
    mockPrisma.customer.create.mockResolvedValue({ id: 'cust-default', name: 'Cliente', points: 0, tier: 'BRONCE' });
    mockPrisma.customer.upsert.mockResolvedValue({ id: 'cust-default', name: 'Cliente', points: 0, tier: 'BRONCE' });
    mockPrisma.orderCounter.upsert.mockResolvedValue({ lastOrderNumber: 10 });
    mockPrisma.orderCounter.update.mockResolvedValue({ lastOrderNumber: 11 });
  });

  it('1. Permite pedido de invitado SIN correo electrónico (correo opcional/undefined)', async () => {
    const createdOrder = {
      id: 'ord-no-email',
      orderNumber: 11,
      restaurantId: 'rest-1',
      customerName: 'Carlos Perez',
      customerPhone: '3007654321',
      customerEmail: null,
      customerAddress: 'Calle 72 #45-10',
      total: 25000,
      subtotal: 25000,
      deliveryFeeApplied: 0,
      discountAmount: 0,
      paymentMethod: 'CASH',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      items: [{ id: 'item-1', productId: 'prod-1', quantity: 1, unitPrice: 25000, subtotal: 25000, product: mockProduct }]
    };

    mockPrisma.customer.upsert.mockResolvedValue({ id: 'cust-1', name: 'Carlos Perez', phone: '3007654321', email: null });
    mockPrisma.order.create.mockResolvedValue(createdOrder);

    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: {
          name: 'Carlos Perez',
          phone: '3007654321',
          address: 'Calle 72 #45-10'
          // Sin email intencionalmente
        },
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'CASH',
        fulfillmentMode: 'PICKUP'
      });

    expect(res.status).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.customerName).toBe('Carlos Perez');
    expect(res.body.order.customerEmail).toBeNull();
    expect(mockSocket.emitNewOrder).toHaveBeenCalledWith('rest-1', createdOrder);
  });

  it('2. Permite pedido de invitado con correo como cadena vacía "" y lo normaliza', async () => {
    const createdOrder = {
      id: 'ord-empty-email',
      orderNumber: 12,
      restaurantId: 'rest-1',
      customerName: 'Maria Gomez',
      customerPhone: '3012345678',
      customerEmail: null,
      total: 25000,
      status: 'PENDING',
      items: [{ id: 'item-2', productId: 'prod-1', quantity: 1, unitPrice: 25000, subtotal: 25000, product: mockProduct }]
    };

    mockPrisma.customer.upsert.mockResolvedValue({ id: 'cust-2', name: 'Maria Gomez', email: null });
    mockPrisma.order.create.mockResolvedValue(createdOrder);

    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: {
          name: 'Maria Gomez',
          phone: '3012345678',
          email: '' // Cadena vacía típica cuando el usuario deja el input en blanco
        },
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'NEQUI',
        fulfillmentMode: 'PICKUP'
      });

    expect(res.status).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.customerName).toBe('Maria Gomez');
  });

  it('3. Permite pedido para consumo en mesa con número de mesa (showTableNumber)', async () => {
    const createdOrder = {
      id: 'ord-mesa-4',
      orderNumber: 13,
      restaurantId: 'rest-1',
      customerName: 'Mesa 4 - Juan',
      tableNumber: 4,
      total: 25000,
      status: 'PENDING',
      items: [{ id: 'item-3', productId: 'prod-1', quantity: 1, unitPrice: 25000, subtotal: 25000, product: mockProduct }]
    };

    mockPrisma.customer.upsert.mockResolvedValue({ id: 'cust-3', name: 'Mesa 4 - Juan' });
    mockPrisma.order.create.mockResolvedValue(createdOrder);

    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: {
          name: 'Mesa 4 - Juan'
        },
        tableNumber: 4,
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'CASH',
        fulfillmentMode: 'PICKUP'
      });

    expect(res.status).toBe(201);
    expect(res.body.order.tableNumber).toBe(4);
  });

  it('4. Aplica correctamente cupón de porcentaje si cumple el valor mínimo', async () => {
    const createdOrder = {
      id: 'ord-coupon-ok',
      orderNumber: 14,
      restaurantId: 'rest-1',
      customerName: 'Laura Cupon',
      subtotal: 25000,
      discountAmount: 2500, // 10% de 25000
      total: 22500,
      couponCode: 'PROMO10',
      status: 'PENDING',
      items: [{ id: 'item-4', productId: 'prod-1', quantity: 1, unitPrice: 25000, subtotal: 25000, product: mockProduct }]
    };

    mockPrisma.customer.upsert.mockResolvedValue({ id: 'cust-4', name: 'Laura Cupon' });
    mockPrisma.order.create.mockResolvedValue(createdOrder);

    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Laura Cupon' },
        couponCode: 'PROMO10',
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'NEQUI',
        fulfillmentMode: 'PICKUP'
      });

    expect(res.status).toBe(201);
    expect(res.body.order.couponCode).toBe('PROMO10');
    expect(res.body.order.discountAmount).toBe(2500);
    expect(res.body.order.total).toBe(22500);
  });

  it('5. No aplica descuento si el cupón está inactivo o vencido', async () => {
    const createdOrder = {
      id: 'ord-coupon-fail',
      orderNumber: 15,
      restaurantId: 'rest-1',
      customerName: 'Pedro Test',
      subtotal: 25000,
      discountAmount: 0,
      total: 25000,
      status: 'PENDING',
      items: [{ id: 'item-5', productId: 'prod-1', quantity: 1, unitPrice: 25000, subtotal: 25000, product: mockProduct }]
    };

    mockPrisma.customer.upsert.mockResolvedValue({ id: 'cust-5', name: 'Pedro Test' });
    mockPrisma.order.create.mockResolvedValue(createdOrder);

    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Pedro Test' },
        couponCode: 'INACTIVO',
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'CASH',
        fulfillmentMode: 'PICKUP'
      });

    expect(res.status).toBe(201);
    expect(res.body.order.discountAmount).toBe(0);
    expect(res.body.order.total).toBe(25000);
  });

  it('6. Rechaza pedidos con método de pago no soportado', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Usuario Invalido' },
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'CRYPTO_BITCOIN' // Método inválido
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Datos invalidos');
  });
});
