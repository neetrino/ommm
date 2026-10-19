import { BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import {
  assertStudioPaidAtEditable,
  resolveStudioPaidAt,
} from './payments-paid-at';

const NOW = new Date('2026-10-19T08:00:00.000Z');

describe('resolveStudioPaidAt', () => {
  it('accepts a studio datetime on a previous day', () => {
    const paidAt = resolveStudioPaidAt('2026-10-18T10:00:00.000Z', NOW);
    expect(paidAt.toISOString()).toBe('2026-10-18T10:00:00.000Z');
  });

  it('rejects a paid date after the current studio day', () => {
    expect(() => resolveStudioPaidAt('2026-10-20T08:00:00.000Z', NOW)).toThrow(
      BadRequestException,
    );
  });

  it('rejects a paid date older than the lookback window', () => {
    expect(() => resolveStudioPaidAt('2020-01-01T08:00:00.000Z', NOW)).toThrow(
      BadRequestException,
    );
  });

  it('rejects an unparseable instant', () => {
    expect(() => resolveStudioPaidAt('not-a-date', NOW)).toThrow(
      BadRequestException,
    );
  });
});

describe('assertStudioPaidAtEditable', () => {
  it('allows succeeded cash payments', () => {
    expect(() =>
      assertStudioPaidAtEditable({
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: 'CASH',
      }),
    ).not.toThrow();
  });

  it('rejects pending and online card payments', () => {
    expect(() =>
      assertStudioPaidAtEditable({
        status: PaymentStatus.PENDING,
        paymentMethod: 'CASH',
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      assertStudioPaidAtEditable({
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: 'CARD',
      }),
    ).toThrow(BadRequestException);
  });
});
