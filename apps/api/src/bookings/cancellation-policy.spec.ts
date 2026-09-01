import {
  DEFAULT_CANCELLATION_GRACE_MINUTES,
  isPenalizedCancellation,
  isWithinCancellationGracePeriod,
  resolveCancellationPenaltyHours,
  shouldApplyCancellationPenalty,
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
  const classStart = new Date(Date.UTC(2026, 5, 10, 19, 0, 0, 0));

  it('is free at exactly 24 hours before class start', () => {
    const now = new Date(2026, 5, 9, 19, 0, 0, 0);
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(false);
  });

  it('is free more than 24 hours before class start', () => {
    const now = new Date(2026, 5, 9, 15, 0, 0, 0);
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(false);
  });

  it('is penalized within 24 hours of class start', () => {
    const now = new Date(2026, 5, 9, 19, 1, 0, 0);
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(true);
  });

  it('is penalized one minute before class start', () => {
    const now = new Date(2026, 5, 10, 18, 59, 0, 0);
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(true);
  });
});

describe('shouldApplyCancellationPenalty', () => {
  const classStart = new Date(Date.UTC(2026, 7, 31, 11, 0, 0, 0));

  it('does not penalize a cancel inside the booking grace window', () => {
    const bookedAt = new Date(Date.UTC(2026, 7, 31, 6, 17, 50, 0));
    const now = new Date(Date.UTC(2026, 7, 31, 6, 19, 50, 0));
    expect(isWithinCancellationGracePeriod(bookedAt, DEFAULT_CANCELLATION_GRACE_MINUTES, now)).toBe(
      true,
    );
    expect(
      shouldApplyCancellationPenalty({
        startsAt: classStart,
        bookingCreatedAt: bookedAt,
        penaltyHours: 24,
        now,
      }),
    ).toBe(false);
  });

  it('penalizes a late cancel after the grace window', () => {
    const bookedAt = new Date(Date.UTC(2026, 7, 31, 5, 0, 0, 0));
    const now = new Date(Date.UTC(2026, 7, 31, 6, 19, 50, 0));
    expect(
      shouldApplyCancellationPenalty({
        startsAt: classStart,
        bookingCreatedAt: bookedAt,
        penaltyHours: 24,
        now,
      }),
    ).toBe(true);
  });

  it('does not penalize after grace when class is still outside the notice window', () => {
    const farClassStart = new Date(Date.UTC(2026, 8, 10, 11, 0, 0, 0));
    const bookedAt = new Date(Date.UTC(2026, 7, 31, 5, 0, 0, 0));
    const now = new Date(Date.UTC(2026, 7, 31, 6, 19, 50, 0));
    expect(
      shouldApplyCancellationPenalty({
        startsAt: farClassStart,
        bookingCreatedAt: bookedAt,
        penaltyHours: 24,
        now,
      }),
    ).toBe(false);
  });
});
