import {
  assertPackageHasAvailableStock,
  packageHasPublicStock,
  packageStockRequiresDeactivation,
} from './packages-stock.helpers';

describe('packages-stock.helpers', () => {
  describe('packageHasPublicStock', () => {
    it('treats null stock as unlimited', () => {
      expect(packageHasPublicStock({ availableQuantity: null })).toBe(true);
    });

    it('allows positive stock', () => {
      expect(packageHasPublicStock({ availableQuantity: 3 })).toBe(true);
    });

    it('blocks zero stock', () => {
      expect(packageHasPublicStock({ availableQuantity: 0 })).toBe(false);
    });
  });

  describe('assertPackageHasAvailableStock', () => {
    it('does not throw for unlimited stock', () => {
      expect(() =>
        assertPackageHasAvailableStock({ availableQuantity: null }),
      ).not.toThrow();
    });

    it('throws when stock is zero', () => {
      expect(() =>
        assertPackageHasAvailableStock({ availableQuantity: 0 }),
      ).toThrow('Package is out of stock');
    });
  });

  describe('packageStockRequiresDeactivation', () => {
    it('requires deactivation only for explicit zero stock', () => {
      expect(packageStockRequiresDeactivation(0)).toBe(true);
      expect(packageStockRequiresDeactivation(null)).toBe(false);
      expect(packageStockRequiresDeactivation(undefined)).toBe(false);
      expect(packageStockRequiresDeactivation(2)).toBe(false);
    });
  });
});
