import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

const EVENTS_SECRET = 'test_events_secret';

function validSig(body) {
  return crypto.createHmac('sha256', EVENTS_SECRET).update(body).digest('hex');
}

const mockPrisma = {
  paymentTransaction: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  restaurantConfig: {
    findUnique: vi.fn()
  }
};

vi.mock('../config/prisma.js', () => ({
  prisma: mockPrisma
}));

vi.mock('../config/env.js', () => ({
  env: {
    WOMPI_ENV: 'sandbox',
    WOMPI_PUBLIC_KEY: 'pub_test_mock',
    WOMPI_PRIVATE_KEY: 'prv_test_mock',
    WOMPI_EVENTS_SECRET: EVENTS_SECRET,
    FRONTEND_URL: 'http://localhost:5173'
  }
}));

const {
  verifyWompiSignature,
  processWompiWebhook
} = await import('../services/payment.service.js');

describe('verifyWompiSignature', () => {
  it('returns false when signature is null', () => {
    expect(verifyWompiSignature('{"test":"body"}', null)).toBe(false);
  });

  it('returns false when signature is empty', () => {
    expect(verifyWompiSignature('{"test":"body"}', '')).toBe(false);
  });

  it('returns true when signature is valid', () => {
    const body = '{"data":{"transaction":{"id":"txn_123"}}}';
    expect(verifyWompiSignature(body, validSig(body))).toBe(true);
  });

  it('returns false when signature is invalid', () => {
    const body = '{"data":{"transaction":{"id":"txn_123"}}}';
    expect(verifyWompiSignature(body, 'a'.repeat(64))).toBe(false);
  });
});

describe('processWompiWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when transaction data is missing', async () => {
    const body = '{"data":{}}';
    const result = await processWompiWebhook(body, validSig(body));
    expect(result).toBeNull();
  });

  it('creates a new APPROVED transaction', async () => {
    const body = JSON.stringify({
      data: {
        transaction: { id: 'txn_new', status: 'APPROVED', reference: 'Pedido-123', amount_in_cents: 50000 }
      }
    });
    mockPrisma.paymentTransaction.findUnique.mockResolvedValue(null);
    mockPrisma.paymentTransaction.create.mockResolvedValue({
      id: 'new-txn', wompiId: 'txn_new', status: 'APPROVED'
    });

    const result = await processWompiWebhook(body, validSig(body));
    expect(result).toBeDefined();
    expect(result.wompiId).toBe('txn_new');
  });

  it('maps DECLINED status correctly', async () => {
    const body = JSON.stringify({
      data: {
        transaction: { id: 'txn_declined', status: 'DECLINED', reference: 'Pedido-456', amount_in_cents: 30000 }
      }
    });
    mockPrisma.paymentTransaction.findUnique.mockResolvedValue(null);
    mockPrisma.paymentTransaction.create.mockResolvedValue({
      id: 'declined-txn', wompiId: 'txn_declined', status: 'DECLINED'
    });

    const result = await processWompiWebhook(body, validSig(body));
    expect(result.status).toBe('DECLINED');
  });

  it('updates existing transaction status', async () => {
    const body = JSON.stringify({
      data: {
        transaction: { id: 'txn_existing', status: 'APPROVED', reference: 'Pedido-789', amount_in_cents: 25000 }
      }
    });
    mockPrisma.paymentTransaction.findUnique.mockResolvedValue({
      id: 'existing', wompiId: 'txn_existing', status: 'PENDING'
    });
    mockPrisma.paymentTransaction.update.mockResolvedValue({
      id: 'existing', wompiId: 'txn_existing', status: 'APPROVED'
    });

    const result = await processWompiWebhook(body, validSig(body));
    expect(result.status).toBe('APPROVED');
    expect(mockPrisma.paymentTransaction.update).toHaveBeenCalled();
  });
});
