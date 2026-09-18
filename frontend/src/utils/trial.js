/**
 * Calculates remaining trial days and expiration status for a restaurant.
 * @param {string|Date|undefined} restaurantCreatedAt
 * @param {boolean} [isExempt=false]
 * @returns {{ daysLeft: number, isTrialExpired: boolean }}
 */
export function getTrialStatus(restaurantCreatedAt, isExempt = false) {
  if (!restaurantCreatedAt || isExempt) {
    return { daysLeft: 14, isTrialExpired: false };
  }
  const createdTime = new Date(restaurantCreatedAt).getTime();
  const expiryTime = createdTime + 14 * 86400000;
  const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 86400000));
  return {
    daysLeft: remaining,
    isTrialExpired: remaining <= 0
  };
}
