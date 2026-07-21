import { isAddressInZone } from './maps.service.js';

export const TIER_THRESHOLDS = { BRONCE: 0, PLATA: 500, ORO: 2000, DIAMANTE: 5000 };
export const POINTS_PER_PESO = 0.01;
export const POINTS_VALUE = 10;

export const normalizeCoupons = (config) => Array.isArray(config?.coupons) ? config.coupons : [];
export const normalizeZones = (config) => Array.isArray(config?.deliveryZones) ? config.deliveryZones : [];
export const normalizeLoyalty = (config) => config?.loyaltyProgram || null;

export const getTier = (points) => {
  if (points >= 5000) return 'DIAMANTE';
  if (points >= 2000) return 'ORO';
  if (points >= 500) return 'PLATA';
  return 'BRONCE';
};

export const calculateCouponDiscount = ({ subtotal, coupon }) => {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.minimumOrder && subtotal < Number(coupon.minimumOrder)) return 0;

  const discountValue = Number(coupon.discountValue);
  if (Number.isNaN(discountValue) || discountValue <= 0) return 0;

  if (coupon.discountType === 'PERCENTAGE') {
    return Math.min(subtotal, subtotal * (discountValue / 100));
  }
  return Math.min(subtotal, discountValue);
};

export const calculatePointsDiscount = ({ loyalty, pointsRedeemed }) => {
  if (!loyalty?.enabled || !pointsRedeemed || pointsRedeemed <= 0) return 0;
  return pointsRedeemed * POINTS_VALUE;
};

export const detectZoneFromAddress = async (restaurantId, address, deliveryZones) => {
  if (!address) return { zone: null, geoStatus: 'no_address' };

  const geo = await isAddressInZone(restaurantId, address);
  if (!geo) return { zone: null, geoStatus: 'geocode_failed' };
  if (!geo.inZone) return { zone: null, geoStatus: 'outside_all_zones' };

  const matched = deliveryZones.find((z) => z.id === geo.zone.id && z.isActive !== false);
  return { zone: matched || null, geoStatus: matched ? 'matched' : 'zone_not_found' };
};
