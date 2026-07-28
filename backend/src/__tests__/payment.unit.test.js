import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCrypto = vi.hoisted(() => ({
  default: {
    createHmac: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('expected-signature')
    })),
    timingSafeEqual: vi.fn((a, b) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    })
  }
}));

vi.mock('crypto', () => mockCrypto);

vi.mock('../config/prisma.js', () => ({
  prisma: {
    paymentTransaction: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    restaurantConfig: { findUnique: vi.fn() }
  }
}));

const mockEnv = vi.hoisted(() => ({
  WOMPI_ENV: 'sandbox',
  WOMPI_PUBLIC_KEY: 'pub_test',
  WOMPI_PRIVATE_KEY: 'priv_test',
  WOMPI_EVENTS_SECRET: 'test-secret-123',
  FRONTEND_URL: 'http://localhost:5173'
}));

vi.mock('../config/env.js', () => ({ env: mockEnv }));

import { verifyWompiSignature } from '../services/payment.service.js';

describe('Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyWompiSignature', () => {
    it('returns true when secret is not configured', () => {
      const originalSecret = mockEnv.WOMPI_EVENTS_SECRET;
      mockEnv.WOMPI_EVENTS_SECRET = '';
      const result = verifyWompiSignature('raw-body', 'some-signature');
      expect(result).toBe(true);
      mockEnv.WOMPI_EVENTS_SECRET = originalSecret;
    });

    it('returns true when secret is not configured (undefined)', () => {
      const originalSecret = mockEnv.WOMPI_EVENTS_SECRET;
      delete mockEnv.WOMPI_EVENTS_SECRET;
      const result = verifyWompiSignature('raw-body', 'some-signature');
      expect(result).toBe(true);
      mockEnv.WOMPI_EVENTS_SECRET = originalSecret;
    });

    it('returns false when signature is missing', () => {
      const result = verifyWompiSignature('raw-body', null);
      expect(result).toBe(false);
    });

    it('returns false when signature is empty', () => {
      const result = verifyWompiSignature('raw-body', '');
      expect(result).toBe(false);
    });

    it('verifies valid signature correctly', () => {
      const result = verifyWompiSignature('{"data":"test"}', 'expected-signature');
      expect(result).toBe(true);
      expect(mockCrypto.default.createHmac).toHaveBeenCalledWith('sha256', 'test-secret-123');
    });

    it('rejects invalid signature', () => {
      mockCrypto.default.createHmac.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('different-signature')
      });
      mockCrypto.default.timingSafeEqual.mockReturnValue(false);

      const result = verifyWompiSignature('{"data":"test"}', 'wrong-signature');
      expect(result).toBe(false);
    });
  });
});
