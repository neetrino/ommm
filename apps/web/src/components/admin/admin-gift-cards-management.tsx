"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminGiftCardDrawer } from "@/components/admin/admin-gift-cards-drawer";
import {
  countActiveGiftCardFilters,
  filterGiftCards,
  purchaserLabel,
  sortGiftCards,
} from "@/components/admin/admin-gift-cards-filter-logic";
import { AdminGiftCardsFilters } from "@/components/admin/admin-gift-cards-filters";
import { AdminGiftCardsShell } from "@/components/admin/admin-gift-cards-shell";
import type { AdminGiftCardRow, GiftCardFilterValues } from "@/components/admin/admin-gift-cards-types";
import {
  buildGiftCardFiltersQuery,
  GIFT_CARD_FILTER_QUERY_KEYS,
} from "@/components/admin/admin-gift-cards-url";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminGiftCardsManagementProps = {
  giftCards: readonly AdminGiftCardRow[];
  locale: string;
  initialFilters: GiftCardFilterValues;
};

const SEARCH_DEBOUNCE_MS = 300;

function displayDate(value: string | null): string {
  if (value === null) {
    return "—";
  }
  const formatted = formatDateForUi(value);
  return formatted.length > 0 ? formatted : "—";
}

export function AdminGiftCardsManagement({
  giftCards,
  locale,
  initialFilters,
}: AdminGiftCardsManagementProps) {
  const t = useTranslations("adminPages.giftCards");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [filters, setFilters] = useState<GiftCardFilterValues>(initialFilters);
  const [selected, setSelected] = useState<AdminGiftCardRow | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const filtered = useMemo(
    () => sortGiftCards(filterGiftCards(giftCards, filters), filters.order),
    [filters, giftCards],
  );

  const activeFilterCount = countActiveGiftCardFilters(filters);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    setIsFiltering(true);
    const handle = window.setTimeout(() => {
      syncFiltersToUrl(filters);
      setIsFiltering(false);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [filters.search]);

  function updateFilter<K extends keyof GiftCardFilterValues>(
    key: K,
    value: GiftCardFilterValues[K],
  ) {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key !== "search") {
        syncFiltersToUrl(next);
      }
      return next;
    });
  }

  function resetFilters() {
    const cleared: GiftCardFilterValues = {
      search: "",
      status: "all",
      expiration: "all",
      amountMin: "",
      amountMax: "",
      order: "newest",
      quick: "",
    };
    setFilters(cleared);
    syncFiltersToUrl(cleared);
  }

  function syncFiltersToUrl(values: GiftCardFilterValues) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    for (const key of GIFT_CARD_FILTER_QUERY_KEYS) {
      params.delete(key);
    }
    const filterQuery = buildGiftCardFiltersQuery(values);
    if (filterQuery.length > 0) {
      for (const [key, entryValue] of new URLSearchParams(filterQuery)) {
        params.set(key, entryValue);
      }
    }
    const qs = params.toString();
    if (qs === searchParams.toString()) {
      return;
    }
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleChanged() {
    setSelected(null);
    router.refresh();
  }

  return (
    <AdminGiftCardsShell>
      <AdminGiftCardsFilters
        values={filters}
        activeFilterCount={activeFilterCount}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      {isFiltering ? (
        <p className="text-sm text-sage-500" role="status">
          {t("loading")}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-sage-500">{t("empty")}</p>
      ) : (
        <div className={adminChrome.tableWrap}>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colPurchaser")}</th>
                <th className={adminChrome.th}>{t("colAmount")}</th>
                <th className={adminChrome.th}>{t("colStatus")}</th>
                <th className={adminChrome.th}>{t("colCreated")}</th>
                <th className={adminChrome.th}>{t("colExpiration")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((card) => (
                <tr key={card.id} className={adminChrome.tr}>
                  <td className={adminChrome.td}>
                    <button
                      type="button"
                      className="text-left font-medium text-sage-900 underline-offset-2 hover:underline"
                      onClick={() => setSelected(card)}
                    >
                      {purchaserLabel(card)}
                    </button>
                  </td>
                  <td className={adminChrome.td}>
                    {formatAmdFromCents(card.amountCents, locale)}
                  </td>
                  <td className={adminChrome.td}>{t(`statusValues.${card.status}`)}</td>
                  <td className={adminChrome.td}>{displayDate(card.createdAt)}</td>
                  <td className={adminChrome.td}>{displayDate(card.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminGiftCardDrawer
        card={selected}
        locale={locale}
        onClose={() => setSelected(null)}
        onChanged={handleChanged}
      />
    </AdminGiftCardsShell>
  );
}
