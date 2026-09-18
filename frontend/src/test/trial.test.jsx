import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTrialStatus } from '../utils/trial';

describe('getTrialStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns default 14 days and not expired if no createdAt is provided', () => {
    const status = getTrialStatus(null);
    expect(status.daysLeft).toBe(14);
    expect(status.isTrialExpired).toBe(false);
  });

  it('returns not expired for exempt users regardless of creation date', () => {
    const status = getTrialStatus('2020-01-01T00:00:00.000Z', true);
    expect(status.daysLeft).toBe(14);
    expect(status.isTrialExpired).toBe(false);
  });

  it('calculates remaining days correctly when within 14 days trial', () => {
    const baseTime = new Date('2026-06-01T12:00:00.000Z');
    vi.setSystemTime(baseTime);

    // Created 4 days ago
    const createdAt = new Date(baseTime.getTime() - 4 * 86400000).toISOString();
    const status = getTrialStatus(createdAt, false);

    expect(status.daysLeft).toBe(10);
    expect(status.isTrialExpired).toBe(false);
  });

  it('marks trial as expired when more than 14 days have passed', () => {
    const baseTime = new Date('2026-06-20T12:00:00.000Z');
    vi.setSystemTime(baseTime);

    // Created 15 days ago
    const createdAt = new Date(baseTime.getTime() - 15 * 86400000).toISOString();
    const status = getTrialStatus(createdAt, false);

    expect(status.daysLeft).toBe(0);
    expect(status.isTrialExpired).toBe(true);
  });
});
