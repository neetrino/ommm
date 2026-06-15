import { PackagePlanType } from '@prisma/client';
import {
  buildCombinedPackageName,
  classTypeMatchesPackageCategory,
  dedupeCategoryNames,
  isPlanEligibleForClassType,
  normalizePackageCategoryLabel,
  packageCategoryComparisonKey,
  resolvePlanAllowedCategories,
} from './package-eligibility.util';

describe('package-eligibility.util', () => {
  const danceClassType = {
    id: 'ct-dance',
    name: 'Dance',
    slug: 'dance',
  };

  const pilatesClassType = {
    id: 'ct-pilates',
    name: 'Mat Pilates',
    slug: 'mat-pilates',
  };

  it('matches class type by category label', () => {
    expect(
      classTypeMatchesPackageCategory('Dance', danceClassType),
    ).toBe(true);
    expect(
      classTypeMatchesPackageCategory('Mat Pilates', pilatesClassType),
    ).toBe(true);
    expect(
      classTypeMatchesPackageCategory('Dance', pilatesClassType),
    ).toBe(false);
  });

  it('resolves allowed categories for combined plans', () => {
    const categories = resolvePlanAllowedCategories({
      planType: PackagePlanType.COMBINED,
      categoryName: 'Dance + Mat Pilates',
      allowedCategoryNames: ['Dance', 'Mat Pilates'],
    });
    expect(categories).toEqual(['Dance', 'Mat Pilates']);
  });

  it('checks combined plan eligibility across union categories', () => {
    const combinedPlan = {
      planType: PackagePlanType.COMBINED,
      categoryName: 'Dance + Mat Pilates',
      allowedCategoryNames: ['Dance', 'Mat Pilates'],
    };
    expect(isPlanEligibleForClassType(combinedPlan, danceClassType)).toBe(true);
    expect(isPlanEligibleForClassType(combinedPlan, pilatesClassType)).toBe(
      true,
    );
  });

  it('builds combined package names', () => {
    expect(buildCombinedPackageName(['Dance', 'Mat Pilates'])).toBe(
      'Dance + Mat Pilates',
    );
  });

  it('dedupes category names case-insensitively', () => {
    expect(dedupeCategoryNames(['Dance', 'dance', 'Mat Pilates'])).toEqual([
      'Dance',
      'Mat Pilates',
    ]);
  });

  it('normalizes category labels', () => {
    expect(normalizePackageCategoryLabel('  Mat   Pilates ')).toBe(
      'Mat Pilates',
    );
    expect(packageCategoryComparisonKey('Dance')).toBe('dance');
  });
});
