export const GIFT_CARD_STATUSES = [
  "ACTIVE",
  "REDEEMED",
  "EXPIRED",
  "DEACTIVATED",
] as const;

export type GiftCardStatus = (typeof GIFT_CARD_STATUSES)[number];

export type AdminGiftCardBatchRow = {
  id: string;
  amountAmd: number;
  imageUrl: string | null;
  status: GiftCardStatus;
  totalQuantity: number;
  availableQuantity: number;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
  purchaser: { email: string; name: string | null };
  recipient: { email: string; name: string | null } | null;
};

export type AdminGiftCardRow = {
  id: string;
  code: string;
  amountAmd: number;
  balanceAmd: number;
  imageUrl: string | null;
  status: GiftCardStatus;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
  purchaser: { email: string; name: string | null };
  recipient: { email: string; name: string | null } | null;
};

export type AdminAssignableUser = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
};

export type AdminGiftCardRedemptionEvent = {
  type: "CREATED" | "ASSIGNED" | "ISSUED" | "REDEEMED" | "DEACTIVATED";
  at: string;
  description: string;
};

export type AdminGiftCardRedemptionHistory = {
  cardId?: string;
  batchId?: string;
  status: GiftCardStatus;
  amountAmd?: number;
  balanceAmd?: number;
  totalQuantity?: number;
  availableQuantity?: number;
  issuedCount?: number;
  redeemedCount?: number;
  events: AdminGiftCardRedemptionEvent[];
  note?: string;
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
