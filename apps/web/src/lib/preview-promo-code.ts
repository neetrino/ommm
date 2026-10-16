import { apiFetch } from "@/lib/api";

export type PromoPurchaseLine = {
  kind: "PACKAGE" | "DROPIN" | "GIFT" | "BAR" | "OTHER";
  packagePlanId?: string;
};

export type PromoPreview = {
  code: string;
  discountAmountCents: number;
  remainderGiftCents: number;
  amountAfterCouponCents: number;
  giftCreditsAppliedCents: number;
  chargeCents: number;
};

type PromoPreviewResponse = Omit<PromoPreview, "code"> & { code: string };

export async function previewPromoCode(input: {
  code: string;
  subtotalCents: number;
  lines: readonly PromoPurchaseLine[];
  useGiftCredits?: boolean;
  giftCardIds?: readonly string[];
}): Promise<PromoPreview> {
  const preview = await apiFetch<PromoPreviewResponse>("/coupons/preview", {
    method: "POST",
    body: JSON.stringify({
      code: input.code,
      subtotalCents: input.subtotalCents,
      lines: input.lines,
      useGiftCredits: input.useGiftCredits === true,
      ...(input.giftCardIds && input.giftCardIds.length > 0
        ? { giftCardIds: input.giftCardIds }
        : {}),
    }),
  });
  return preview;
}

export function readPaymentCoupon(metadata: unknown): { code: string; discountAmountCents: number } | null {
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const coupon = (metadata as Record<string, unknown>).coupon;
  if (coupon === null || typeof coupon !== "object" || Array.isArray(coupon)) {
    return null;
  }
  const record = coupon as Record<string, unknown>;
  if (typeof record.code !== "string" || typeof record.discountAmountCents !== "number") {
    return null;
  }
  return { code: record.code, discountAmountCents: record.discountAmountCents };
}
