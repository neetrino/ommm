import type { AdminCouponRow, CouponProductKind } from "@/components/admin/admin-coupons-types";

/** Matches `COUPON_ELIGIBLE_PRODUCT_MAX` on the API. */
const MAX_COUPON_ELIGIBLE_PRODUCTS = 50;

export type CouponDraft = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string;
  validFrom: string;
  validUntil: string;
  totalUsageLimit: string;
  usageLimitPerUser: string;
  eligibleAllUsers: boolean;
  emails: string;
  eligibleAllProducts: boolean;
  kinds: CouponProductKind[];
  /** Empty means every package. Each id becomes its own package rule. */
  packagePlanIds: string[];
};

export function emptyCouponDraft(): CouponDraft {
  return {
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    validFrom: "",
    validUntil: "",
    totalUsageLimit: "",
    usageLimitPerUser: "1",
    eligibleAllUsers: true,
    emails: "",
    eligibleAllProducts: true,
    kinds: [],
    packagePlanIds: [],
  };
}

export function couponDraftFromRow(editing: AdminCouponRow | null): CouponDraft {
  if (editing === null) {
    return emptyCouponDraft();
  }
  return {
    code: editing.code,
    discountType: editing.discountType,
    discountValue: String(editing.discountValue),
    validFrom: toLocalInput(editing.validFrom),
    validUntil: toLocalInput(editing.validUntil),
    totalUsageLimit: editing.totalUsageLimit?.toString() ?? "",
    usageLimitPerUser: editing.usageLimitPerUser?.toString() ?? "",
    eligibleAllUsers: editing.eligibleAllUsers,
    emails: editing.eligibleUsers.map((user) => user.email).join(", "),
    eligibleAllProducts: editing.eligibleAllProducts,
    kinds: uniqueCouponKinds(editing.eligibleProducts.map((row) => row.kind)),
    packagePlanIds: packagePlanIdsFromProducts(editing.eligibleProducts),
  };
}

export function uniqueCouponKinds(kinds: readonly CouponProductKind[]): CouponProductKind[] {
  const unique: CouponProductKind[] = [];
  for (const kind of kinds) {
    if (!unique.includes(kind)) {
      unique.push(kind);
    }
  }
  return unique;
}

/** A package rule without an id already covers every package, so specific ids are dropped. */
export function packagePlanIdsFromProducts(
  products: readonly { kind: CouponProductKind; packagePlanId: string | null }[],
): string[] {
  const packageRows = products.filter((row) => row.kind === "PACKAGE");
  const coversEveryPackage = packageRows.some((row) => {
    const id = row.packagePlanId?.trim() ?? "";
    return id.length === 0;
  });
  if (coversEveryPackage) {
    return [];
  }
  return capCouponPackagePlanIds(
    ["PACKAGE"],
    packageRows.flatMap((row) => (row.packagePlanId ? [row.packagePlanId] : [])),
  );
}

/** Keeps the saved product list inside the API limit. Other kinds take a slot each. */
export function capCouponPackagePlanIds(
  kinds: readonly CouponProductKind[],
  ids: readonly string[],
): string[] {
  const otherCount = uniqueCouponKinds(kinds).filter((kind) => kind !== "PACKAGE").length;
  const room = Math.max(0, MAX_COUPON_ELIGIBLE_PRODUCTS - otherCount);
  const unique: string[] = [];
  for (const id of ids) {
    const trimmed = id.trim();
    if (trimmed.length === 0 || unique.includes(trimmed)) {
      continue;
    }
    if (unique.length >= room) {
      break;
    }
    unique.push(trimmed);
  }
  return unique;
}

export function couponPayloadFromDraft(draft: CouponDraft) {
  const kinds = uniqueCouponKinds(draft.kinds);
  const planIds = kinds.includes("PACKAGE")
    ? capCouponPackagePlanIds(kinds, draft.packagePlanIds)
    : [];
  const products = kinds.flatMap((kind) => {
    if (kind !== "PACKAGE" || planIds.length === 0) {
      return [{ kind }];
    }
    return planIds.map((packagePlanId) => ({ kind, packagePlanId }));
  });
  return {
    code: draft.code,
    discountType: draft.discountType,
    discountValue: Number(draft.discountValue),
    ...(draft.validFrom ? { validFrom: localDayIso(draft.validFrom, false) } : {}),
    ...(draft.validUntil ? { validUntil: localDayIso(draft.validUntil, true) } : {}),
    ...(draft.totalUsageLimit ? { totalUsageLimit: Number(draft.totalUsageLimit) } : {}),
    ...(draft.usageLimitPerUser ? { usageLimitPerUser: Number(draft.usageLimitPerUser) } : {}),
    eligibleAllUsers: draft.eligibleAllUsers,
    eligibleEmails: draft.emails.split(/[,\s]+/).filter(Boolean),
    eligibleAllProducts: draft.eligibleAllProducts,
    eligibleProducts: products,
  };
}

function toLocalInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localDayIso(value: string, endOfDay: boolean): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
  return date.toISOString();
}
