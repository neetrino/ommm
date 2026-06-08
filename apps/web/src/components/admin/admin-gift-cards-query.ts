import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import type { GiftCardFilterValues } from "@/components/admin/admin-gift-cards-types";
import { buildGiftCardFiltersQuery } from "@/components/admin/admin-gift-cards-url";
import { parseListPageParams } from "@/lib/list-pagination";

export type AdminGiftCardsListPayload = {
  items: AdminGiftCardBatchRow[];
  total: number;
  take: number;
  offset: number;
};

export function buildAdminGiftCardsListEndpoint(
  take: number,
  offset: number,
  filters?: GiftCardFilterValues,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  if (filters) {
    const filterQuery = buildGiftCardFiltersQuery(filters);
    for (const [key, value] of new URLSearchParams(filterQuery)) {
      params.set(key, value);
    }
  }
  return `/gift-cards/admin/batches?${params.toString()}`;
}

export function parseAdminGiftCardsPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search);
}
