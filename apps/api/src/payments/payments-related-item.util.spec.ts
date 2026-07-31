import {
  buildPackagePaymentDescription,
  readPackageNameFromPaymentDescription,
  resolveAdminPaymentRelatedItemGroupName,
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
    const packageLabels = new Map([
      ['up-1', { name: 'Unlimited Flow', groupName: 'Reformer' }],
    ]);

    it('prefers the user package snapshot for package payments', () => {
      expect(
        resolveAdminPaymentRelatedItemName({
          source: 'package',
          description: 'Package cmrb2g4eh0001s601u3jg95zf',
          sourceId: 'up-1',
          packageLabelsByUserPackageId: packageLabels,
        }),
      ).toBe('Unlimited Flow');
    });

    it('falls back to the stored description name when lookup is missing', () => {
      expect(
        resolveAdminPaymentRelatedItemName({
          source: 'package',
          description: 'Package: Starter Pack',
          sourceId: 'missing',
          packageLabelsByUserPackageId: packageLabels,
        }),
      ).toBe('Starter Pack');
    });
  });

  describe('resolveAdminPaymentRelatedItemGroupName', () => {
    const packageLabels = new Map([
      ['up-1', { name: 'Unlimited Flow', groupName: 'Reformer' }],
      ['up-2', { name: '8 Classes', groupName: null }],
    ]);

    it('returns the package group name for package payments', () => {
      expect(
        resolveAdminPaymentRelatedItemGroupName({
          source: 'package',
          description: null,
          sourceId: 'up-1',
          packageLabelsByUserPackageId: packageLabels,
        }),
      ).toBe('Reformer');
    });

    it('returns null when group name is missing', () => {
      expect(
        resolveAdminPaymentRelatedItemGroupName({
          source: 'package',
          description: null,
          sourceId: 'up-2',
          packageLabelsByUserPackageId: packageLabels,
        }),
      ).toBeNull();
    });

    it('returns null for non-package sources', () => {
      expect(
        resolveAdminPaymentRelatedItemGroupName({
          source: 'gift',
          description: 'Gift card',
          sourceId: 'up-1',
          packageLabelsByUserPackageId: packageLabels,
        }),
      ).toBeNull();
    });
  });
});
