import type { AdminCouponRow, CouponProductKind } from "@/components/admin/admin-coupons-types";

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
  packagePlanId: string;
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
    packagePlanId: "",
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
    kinds: editing.eligibleProducts.map((row) => row.kind),
    packagePlanId: editing.eligibleProducts.find((row) => row.packagePlanId)?.packagePlanId ?? "",
  };
}

export function couponPayloadFromDraft(draft: CouponDraft) {
  const products = draft.kinds.map((kind) => ({
    kind,
    ...(kind === "PACKAGE" && draft.packagePlanId.trim() ? { packagePlanId: draft.packagePlanId.trim() } : {}),
  }));
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
