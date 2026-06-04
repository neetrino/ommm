import type { GiftCardStatusValue } from "@/components/gift-cards/gift-card-display-helpers";

export type UserGiftCardRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: GiftCardStatusValue;
  imageUrl: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type UserGiftCardSectionKind = "purchased" | "received";
