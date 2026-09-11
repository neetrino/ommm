import {
  hasUnrestoredPackageHold,
  shouldChargePackageOnBook,
} from './package-usage-consume.helpers';

describe('package-usage-consume.helpers', () => {
  it('treats an unrestored row as a held credit', () => {
    expect(
      hasUnrestoredPackageHold([
        { restoredAt: new Date('2026-08-29T17:00:00.000Z') },
        { restoredAt: null },
      ]),
    ).toBe(true);
  });

  it('treats fully restored rows as no hold', () => {
    expect(
      hasUnrestoredPackageHold([
        { restoredAt: new Date('2026-08-29T17:00:00.000Z') },
      ]),
    ).toBe(false);
  });

  it('does not charge again when the booking already holds credit', () => {
    expect(
      shouldChargePackageOnBook({
        usePackageCredit: true,
        requiredSessions: 1,
        alreadyHoldsCredit: true,
      }),
    ).toBe(false);
  });

  it('charges a first booking that uses a package', () => {
    expect(
      shouldChargePackageOnBook({
        usePackageCredit: true,
        requiredSessions: 1,
        alreadyHoldsCredit: false,
      }),
    ).toBe(true);
  });

  it('does not charge a free walk-in without a package', () => {
    expect(
      shouldChargePackageOnBook({
        usePackageCredit: false,
        requiredSessions: 0,
        alreadyHoldsCredit: false,
      }),
    ).toBe(false);
  });
});
