export const GIFT_CARD_STATUSES = [
  "ACTIVE",
  "REDEEMED",
  "EXPIRED",
  "DEACTIVATED",
] as const;

export type GiftCardStatus = (typeof GIFT_CARD_STATUSES)[number];

export type AdminGiftCardRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: GiftCardStatus;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
  purchaser: { email: string; name: string | null };
  recipient: { email: string; name: string | null } | null;
};

export type GiftCardStatusFilter = "all" | GiftCardStatus;

export type GiftCardExpirationFilter = "all" | "valid" | "expired";

export type GiftCardSortOrder =
  | "newest"
  | "oldest"
  | "amountHigh"
  | "amountLow"
  | "expirationSoon";

export type GiftCardQuickFilter = "" | "active" | "expired" | "unredeemed";

export type GiftCardFilterValues = {
  search: string;
  status: GiftCardStatusFilter;
  expiration: GiftCardExpirationFilter;
  amountMin: string;
  amountMax: string;
  order: GiftCardSortOrder;
  quick: GiftCardQuickFilter;
};
