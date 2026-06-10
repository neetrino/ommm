import {
  isPenalizedCancellation,
  resolveCancellationPenaltyHours,
} from './cancellation-policy';

describe('resolveCancellationPenaltyHours', () => {
  it('defaults to 24 hours when studio value is missing', () => {
    expect(resolveCancellationPenaltyHours(undefined)).toBe(24);
    expect(resolveCancellationPenaltyHours(null)).toBe(24);
  });

  it('uses studio value when provided', () => {
    expect(resolveCancellationPenaltyHours(48)).toBe(48);
  });
});

describe('isPenalizedCancellation', () => {
  const classStart = new Date('2026-06-10T19:00:00.000Z');

  it('is free at exactly 24 hours before class start', () => {
    const now = new Date('2026-06-09T19:00:00.000Z');
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(false);
  });

  it('is free more than 24 hours before class start', () => {
    const now = new Date('2026-06-09T15:00:00.000Z');
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(false);
  });

  it('is penalized within 24 hours of class start', () => {
    const now = new Date('2026-06-09T19:01:00.000Z');
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(true);
  });

  it('is penalized one minute before class start', () => {
    const now = new Date('2026-06-10T18:59:00.000Z');
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(true);
  });
});
