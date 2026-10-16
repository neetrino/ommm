import type { CouponPurchaseLine, CouponProductRule } from './coupon.types';

export function purchaseMatchesCouponProducts(input: {
  eligibleAllProducts: boolean;
  rules: readonly CouponProductRule[];
  lines: readonly CouponPurchaseLine[];
}): boolean {
  if (input.lines.length === 0) {
    return false;
  }
  if (input.eligibleAllProducts) {
    return true;
  }
  return input.lines.every((line) =>
    input.rules.some((rule) => lineMatchesProductRule(line, rule)),
  );
}

function lineMatchesProductRule(
  line: CouponPurchaseLine,
  rule: CouponProductRule,
): boolean {
  if (rule.packagePlanId) {
    return line.packagePlanId === rule.packagePlanId;
  }
  return line.kind === rule.productKind;
}
