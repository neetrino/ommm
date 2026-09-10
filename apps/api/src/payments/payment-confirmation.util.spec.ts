import { ManualPaymentMethod } from '@prisma/client';
import {
  grantsImmediatePackageBookingAccess,
  isCardAutoConfirmable,
  requiresManualAdminConfirmation,
} from './payment-confirmation.util';

describe('payment-confirmation.util', () => {
  it('treats card as auto-confirmable', () => {
    expect(isCardAutoConfirmable(ManualPaymentMethod.CARD)).toBe(true);
    expect(isCardAutoConfirmable(ManualPaymentMethod.CASH)).toBe(false);
    expect(isCardAutoConfirmable(ManualPaymentMethod.CARD_TERMINAL)).toBe(
      false,
    );
  });

  it('does not grant booking access before studio payment is confirmed', () => {
    expect(grantsImmediatePackageBookingAccess(ManualPaymentMethod.CASH)).toBe(
      false,
    );
    expect(
      grantsImmediatePackageBookingAccess(ManualPaymentMethod.CARD_TERMINAL),
    ).toBe(false);
    expect(grantsImmediatePackageBookingAccess(ManualPaymentMethod.CARD)).toBe(
      false,
    );
  });

  it('requires manual admin confirmation for pending non-card payments', () => {
    expect(
      requiresManualAdminConfirmation({
        status: 'PENDING',
        paymentMethod: ManualPaymentMethod.CASH,
      }),
    ).toBe(true);
    expect(
      requiresManualAdminConfirmation({
        status: 'PENDING',
        paymentMethod: ManualPaymentMethod.CARD,
      }),
    ).toBe(false);
  });
});
