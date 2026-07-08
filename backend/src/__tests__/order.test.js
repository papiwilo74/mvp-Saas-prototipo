import { describe, it, expect } from 'vitest';

const calculateCouponDiscount = ({ subtotal, coupon }) => {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.minimumOrder && subtotal < Number(coupon.minimumOrder)) return 0;
  if (coupon.discountType === 'PERCENTAGE') {
    return Math.min(subtotal, subtotal * (Number(coupon.discountValue) / 100));
  }
  return Math.min(subtotal, Number(coupon.discountValue));
};

const normalizeCoupons = (config) => Array.isArray(config?.coupons) ? config.coupons : [];
const normalizeZones = (config) => Array.isArray(config?.deliveryZones) ? config.deliveryZones : [];

describe('Cupon discount calculation', () => {
  it('returns 0 for inactive coupon', () => {
    const result = calculateCouponDiscount({
      subtotal: 50000,
      coupon: { isActive: false, discountType: 'PERCENTAGE', discountValue: 10 }
    });
    expect(result).toBe(0);
  });

  it('returns 0 for null coupon', () => {
    expect(calculateCouponDiscount({ subtotal: 50000, coupon: null })).toBe(0);
  });

  it('calculates percentage discount', () => {
    const result = calculateCouponDiscount({
      subtotal: 50000,
      coupon: { isActive: true, discountType: 'PERCENTAGE', discountValue: 10 }
    });
    expect(result).toBe(5000);
  });

  it('calculates fixed discount', () => {
    const result = calculateCouponDiscount({
      subtotal: 50000,
      coupon: { isActive: true, discountType: 'FIXED', discountValue: 15000 }
    });
    expect(result).toBe(15000);
  });

  it('caps discount at subtotal', () => {
    const result = calculateCouponDiscount({
      subtotal: 10000,
      coupon: { isActive: true, discountType: 'FIXED', discountValue: 20000 }
    });
    expect(result).toBe(10000);
  });

  it('respects minimum order', () => {
    const result = calculateCouponDiscount({
      subtotal: 5000,
      coupon: { isActive: true, discountType: 'FIXED', discountValue: 1000, minimumOrder: 10000 }
    });
    expect(result).toBe(0);
  });
});

describe('normalizeCoupons', () => {
  it('returns empty array for null config', () => {
    expect(normalizeCoupons(null)).toEqual([]);
  });

  it('returns coupons array', () => {
    const config = { coupons: [{ code: 'TEST' }] };
    expect(normalizeCoupons(config)).toHaveLength(1);
  });
});

describe('normalizeZones', () => {
  it('returns empty array for null config', () => {
    expect(normalizeZones(null)).toEqual([]);
  });

  it('returns zones array', () => {
    const config = { deliveryZones: [{ name: 'Centro' }] };
    expect(normalizeZones(config)).toHaveLength(1);
  });
});
