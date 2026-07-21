import { describe, it, expect } from 'vitest';
import {
  calculateCouponDiscount,
  calculatePointsDiscount,
  getTier,
  normalizeCoupons,
  normalizeZones,
  normalizeLoyalty,
  POINTS_PER_PESO,
  POINTS_VALUE,
  TIER_THRESHOLDS,
} from '../services/order.pricing.service.js';

// ---------------------------------------------------------------------------
// Group 1: Coupon edge cases
// ---------------------------------------------------------------------------
describe('calculateCouponDiscount – edge cases', () => {
  it('percentage coupon on zero subtotal returns 0', () => {
    const result = calculateCouponDiscount({
      subtotal: 0,
      coupon: { isActive: true, discountType: 'PERCENTAGE', discountValue: 10 },
    });
    expect(result).toBe(0);
  });

  it('fixed coupon exactly equal to subtotal returns subtotal', () => {
    const result = calculateCouponDiscount({
      subtotal: 10000,
      coupon: { isActive: true, discountType: 'FIXED', discountValue: 10000 },
    });
    expect(result).toBe(10000);
  });

  it('coupon with minimumOrder exactly equal to subtotal should apply', () => {
    const result = calculateCouponDiscount({
      subtotal: 50000,
      coupon: { isActive: true, discountType: 'PERCENTAGE', discountValue: 10, minimumOrder: 50000 },
    });
    expect(result).toBe(5000);
  });

  it('percentage coupon with discountValue of 0 returns 0', () => {
    const result = calculateCouponDiscount({
      subtotal: 50000,
      coupon: { isActive: true, discountType: 'PERCENTAGE', discountValue: 0 },
    });
    expect(result).toBe(0);
  });

  it('fixed coupon with discountValue of 0 returns 0', () => {
    const result = calculateCouponDiscount({
      subtotal: 50000,
      coupon: { isActive: true, discountType: 'FIXED', discountValue: 0 },
    });
    expect(result).toBe(0);
  });

  it('coupon with undefined discountType and no discountValue returns 0 (graceful guard)', () => {
    const result = calculateCouponDiscount({
      subtotal: 50000,
      coupon: { isActive: true },
    });
    expect(result).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Group 2: Points edge cases
// ---------------------------------------------------------------------------
const loyaltyEnabled = { enabled: true };
const loyaltyDisabled = { enabled: false };

describe('calculatePointsDiscount – edge cases', () => {
  it('pointsRedeemed = 0 returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyEnabled, pointsRedeemed: 0 })).toBe(0);
  });

  it('pointsRedeemed = undefined returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyEnabled, pointsRedeemed: undefined })).toBe(0);
  });

  it('pointsRedeemed = null returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyEnabled, pointsRedeemed: null })).toBe(0);
  });

  it('loyalty enabled + 10 points redeemed = 100 discount', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyEnabled, pointsRedeemed: 10 })).toBe(100);
  });

  it('loyalty disabled + points redeemed > 0 returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyDisabled, pointsRedeemed: 10 })).toBe(0);
  });

  it('loyalty null + points redeemed > 0 returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: null, pointsRedeemed: 10 })).toBe(0);
  });

  it('loyalty enabled = true but pointsRedeemed = 0 returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyEnabled, pointsRedeemed: 0 })).toBe(0);
  });

  it('loyalty enabled = true but no pointsRedeemed key returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyEnabled })).toBe(0);
  });

  it('negative pointsRedeemed returns 0', () => {
    expect(calculatePointsDiscount({ loyalty: loyaltyEnabled, pointsRedeemed: -5 })).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Group 3: Combined pricing scenarios
// ---------------------------------------------------------------------------
describe('Combined pricing scenarios', () => {
  const combined = (subtotal, coupon, loyalty, pointsRedeemed) => {
    const couponDiscount = calculateCouponDiscount({ subtotal, coupon });
    const pointsDiscount = calculatePointsDiscount({ loyalty, pointsRedeemed });
    return {
      couponDiscount,
      pointsDiscount,
      total: Math.max(0, subtotal - couponDiscount - pointsDiscount),
    };
  };

  it('subtotal=50000, 10% coupon (-5000), 20 pts (-200) => discount=5000, points=200', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      50000,
      { isActive: true, discountType: 'PERCENTAGE', discountValue: 10 },
      loyaltyEnabled,
      20,
    );
    expect(couponDiscount).toBe(5000);
    expect(pointsDiscount).toBe(200);
    expect(total).toBe(44800);
  });

  it('subtotal=50000, FIXED coupon 15000, 50 pts (-500) => discount=15000, points=500', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      50000,
      { isActive: true, discountType: 'FIXED', discountValue: 15000 },
      loyaltyEnabled,
      50,
    );
    expect(couponDiscount).toBe(15000);
    expect(pointsDiscount).toBe(500);
    expect(total).toBe(34500);
  });

  it('subtotal=10000, FIXED coupon 20000 (capped at subtotal), 5 pts (-50) => discount=10000, points=50', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      10000,
      { isActive: true, discountType: 'FIXED', discountValue: 20000 },
      loyaltyEnabled,
      5,
    );
    expect(couponDiscount).toBe(10000);
    expect(pointsDiscount).toBe(50);
    expect(total).toBe(0);
  });

  it('subtotal=30000, no coupon, loyalty disabled, 100 pts => discount=0, points=0', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      30000,
      null,
      loyaltyDisabled,
      100,
    );
    expect(couponDiscount).toBe(0);
    expect(pointsDiscount).toBe(0);
    expect(total).toBe(30000);
  });

  it('subtotal=5000, 50% coupon (-2500), 300 pts (-3000) => combined exceeds subtotal, Math.max(0, ...) floors to 0', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      5000,
      { isActive: true, discountType: 'PERCENTAGE', discountValue: 50 },
      loyaltyEnabled,
      300,
    );
    expect(couponDiscount).toBe(2500);
    expect(pointsDiscount).toBe(3000);
    expect(total).toBe(0);
  });

  it('subtotal=50000, coupon minimumOrder=60000 not met, 10 pts => discount=0, points=100', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      50000,
      { isActive: true, discountType: 'FIXED', discountValue: 5000, minimumOrder: 60000 },
      loyaltyEnabled,
      10,
    );
    expect(couponDiscount).toBe(0);
    expect(pointsDiscount).toBe(100);
    expect(total).toBe(49900);
  });

  it('subtotal=20000, coupon inactive, 10 pts => discount=0, points=100', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      20000,
      { isActive: false, discountType: 'FIXED', discountValue: 5000 },
      loyaltyEnabled,
      10,
    );
    expect(couponDiscount).toBe(0);
    expect(pointsDiscount).toBe(100);
    expect(total).toBe(19900);
  });

  it('subtotal=0, coupon percentage 50% => discount=0, points=0', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      0,
      { isActive: true, discountType: 'PERCENTAGE', discountValue: 50 },
      loyaltyEnabled,
      0,
    );
    expect(couponDiscount).toBe(0);
    expect(pointsDiscount).toBe(0);
    expect(total).toBe(0);
  });

  it('subtotal=35000, FIXED 5000 with minimumOrder=30000 met, 20 pts => discount=5000, points=200', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      35000,
      { isActive: true, discountType: 'FIXED', discountValue: 5000, minimumOrder: 30000 },
      loyaltyEnabled,
      20,
    );
    expect(couponDiscount).toBe(5000);
    expect(pointsDiscount).toBe(200);
    expect(total).toBe(29800);
  });

  it('subtotal=100000, 20% coupon (-20000), 500 pts (-5000) => discount=20000, points=5000', () => {
    const { couponDiscount, pointsDiscount, total } = combined(
      100000,
      { isActive: true, discountType: 'PERCENTAGE', discountValue: 20 },
      loyaltyEnabled,
      500,
    );
    expect(couponDiscount).toBe(20000);
    expect(pointsDiscount).toBe(5000);
    expect(total).toBe(75000);
  });
});

// ---------------------------------------------------------------------------
// Group 4: Tier calculation
// ---------------------------------------------------------------------------
describe('getTier', () => {
  it('0 points => BRONCE', () => {
    expect(getTier(0)).toBe('BRONCE');
  });

  it('499 points => BRONCE', () => {
    expect(getTier(499)).toBe('BRONCE');
  });

  it('500 points => PLATA', () => {
    expect(getTier(500)).toBe('PLATA');
  });

  it('1999 points => PLATA', () => {
    expect(getTier(1999)).toBe('PLATA');
  });

  it('2000 points => ORO', () => {
    expect(getTier(2000)).toBe('ORO');
  });

  it('4999 points => ORO', () => {
    expect(getTier(4999)).toBe('ORO');
  });

  it('5000 points => DIAMANTE', () => {
    expect(getTier(5000)).toBe('DIAMANTE');
  });

  it('10000 points => DIAMANTE', () => {
    expect(getTier(10000)).toBe('DIAMANTE');
  });
});

// ---------------------------------------------------------------------------
// Group 5: Normalizer edge cases
// ---------------------------------------------------------------------------
describe('Normalizer edge cases', () => {
  it('normalizeCoupons with config.coupons = undefined returns []', () => {
    expect(normalizeCoupons({})).toEqual([]);
  });

  it('normalizeCoupons with config = null returns []', () => {
    expect(normalizeCoupons(null)).toEqual([]);
  });

  it('normalizeCoupons with config = undefined returns []', () => {
    expect(normalizeCoupons(undefined)).toEqual([]);
  });

  it('normalizeZones with empty array returns empty array', () => {
    expect(normalizeZones({ deliveryZones: [] })).toEqual([]);
  });

  it('normalizeZones with null config returns []', () => {
    expect(normalizeZones(null)).toEqual([]);
  });

  it('normalizeLoyalty with loyaltyProgram = null returns null', () => {
    expect(normalizeLoyalty({ loyaltyProgram: null })).toBeNull();
  });

  it('normalizeLoyalty with no loyaltyProgram key returns null', () => {
    expect(normalizeLoyalty({})).toBeNull();
  });

  it('normalizeLoyalty with config = null returns null', () => {
    expect(normalizeLoyalty(null)).toBeNull();
  });

  it('normalizeLoyalty with valid loyaltyProgram returns it', () => {
    const lp = { enabled: true, pointsPerPeso: 0.02 };
    expect(normalizeLoyalty({ loyaltyProgram: lp })).toBe(lp);
  });
});

// ---------------------------------------------------------------------------
// Group 6: Constants
// ---------------------------------------------------------------------------
describe('Exported constants', () => {
  it('POINTS_PER_PESO is 0.01', () => {
    expect(POINTS_PER_PESO).toBe(0.01);
  });

  it('POINTS_VALUE is 10', () => {
    expect(POINTS_VALUE).toBe(10);
  });

  it('TIER_THRESHOLDS values are correct', () => {
    expect(TIER_THRESHOLDS).toEqual({ BRONCE: 0, PLATA: 500, ORO: 2000, DIAMANTE: 5000 });
  });
});
