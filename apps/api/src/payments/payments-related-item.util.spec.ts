import {
  buildPackagePaymentDescription,
  readPackageNameFromPaymentDescription,
  resolveAdminPaymentRelatedItemName,
} from './payments-related-item.util';

describe('payments-related-item.util', () => {
  describe('buildPackagePaymentDescription', () => {
    it('stores the plan name in a parseable description', () => {
      expect(buildPackagePaymentDescription('  Monthly Yoga  ')).toBe(
        'Package: Monthly Yoga',
      );
    });
  });

  describe('readPackageNameFromPaymentDescription', () => {
    it('reads the plan name from new descriptions', () => {
      expect(
        readPackageNameFromPaymentDescription('Package: Monthly Yoga'),
      ).toBe('Monthly Yoga');
    });

    it('returns null for legacy id-only descriptions', () => {
      expect(
        readPackageNameFromPaymentDescription(
          'Package cmrb2g4eh0001s601u3jg95zf',
        ),
      ).toBeNull();
    });
  });

  describe('resolveAdminPaymentRelatedItemName', () => {
    const packageNames = new Map([['up-1', 'Unlimited Flow']]);

    it('prefers the user package snapshot for package payments', () => {
      expect(
        resolveAdminPaymentRelatedItemName({
          source: 'package',
          description: 'Package cmrb2g4eh0001s601u3jg95zf',
          sourceId: 'up-1',
          packageNameByUserPackageId: packageNames,
        }),
      ).toBe('Unlimited Flow');
    });

    it('falls back to the stored description name when lookup is missing', () => {
      expect(
        resolveAdminPaymentRelatedItemName({
          source: 'package',
          description: 'Package: Starter Pack',
          sourceId: 'missing',
          packageNameByUserPackageId: packageNames,
        }),
      ).toBe('Starter Pack');
    });
  });
});
