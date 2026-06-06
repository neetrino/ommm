import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { parseListPageParams } from "@/lib/list-pagination";

export type AdminGiftCardsListPayload = {
  items: AdminGiftCardBatchRow[];
  total: number;
  take: number;
  offset: number;
};

export function buildAdminGiftCardsListEndpoint(take: number, offset: number): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return `/gift-cards/admin/batches?${params.toString()}`;
}

export function parseAdminGiftCardsPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search);
}
