import { BadRequestException } from '@nestjs/common';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import {
  assertAdminPaymentMethodChange,
  assertAdminPaymentStatusChange,
} from './payments-admin-mutation.util';

describe('payments-admin-mutation.util', () => {
  it('blocks faking a bank deposit from pending card', () => {
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: ManualPaymentMethod.CARD,
        current: PaymentStatus.PENDING,
        next: PaymentStatus.SUCCEEDED,
      }),
    ).toThrow(BadRequestException);
  });

  it('allows staff to refund a succeeded card payment', () => {
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: ManualPaymentMethod.CARD,
        current: PaymentStatus.SUCCEEDED,
        next: PaymentStatus.REFUNDED,
      }),
    ).not.toThrow();
  });

  it('allows cash to return to unpaid', () => {
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: ManualPaymentMethod.CASH,
        current: PaymentStatus.SUCCEEDED,
        next: PaymentStatus.PENDING,
      }),
    ).not.toThrow();
  });

  it('rejects changing an online card method', () => {
    expect(() =>
      assertAdminPaymentMethodChange({
        current: ManualPaymentMethod.CARD,
        next: ManualPaymentMethod.CASH,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects changing an influencer method', () => {
    expect(() =>
      assertAdminPaymentMethodChange({
        current: ManualPaymentMethod.INFLUENCER,
        next: ManualPaymentMethod.CASH,
      }),
    ).toThrow(BadRequestException);
  });

  it('allows cash and terminal to swap', () => {
    expect(() =>
      assertAdminPaymentMethodChange({
        current: ManualPaymentMethod.CASH,
        next: ManualPaymentMethod.CARD_TERMINAL,
      }),
    ).not.toThrow();
  });

  it('rejects faking success from a failed or refunded studio payment', () => {
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: ManualPaymentMethod.CASH,
        current: PaymentStatus.FAILED,
        next: PaymentStatus.SUCCEEDED,
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: ManualPaymentMethod.CARD_TERMINAL,
        current: PaymentStatus.REFUNDED,
        next: PaymentStatus.SUCCEEDED,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects looping a failed studio payment back to unpaid', () => {
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: ManualPaymentMethod.CASH,
        current: PaymentStatus.FAILED,
        next: PaymentStatus.PENDING,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects editing influencer payment status', () => {
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: ManualPaymentMethod.INFLUENCER,
        current: PaymentStatus.SUCCEEDED,
        next: PaymentStatus.PENDING,
      }),
    ).toThrow('Influencer payments cannot be edited');
  });

  it('allows refunding a succeeded payment with a legacy null method', () => {
    expect(() =>
      assertAdminPaymentStatusChange({
        paymentMethod: null,
        current: PaymentStatus.SUCCEEDED,
        next: PaymentStatus.REFUNDED,
      }),
    ).not.toThrow();
  });
});
