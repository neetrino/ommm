"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminGiftCardDetailsSheet } from "@/components/admin/admin-gift-card-details-sheet";
import { AdminGiftCardsDirectory } from "@/components/admin/admin-gift-cards-directory";
import { countActiveGiftCardFilters } from "@/components/admin/admin-gift-cards-filter-logic";
import { AdminGiftCardsShell } from "@/components/admin/admin-gift-cards-shell";
import type {
  AdminAssignableUser,
  AdminGiftCardBatchRow,
  GiftCardFilterValues,
} from "@/components/admin/admin-gift-cards-types";
import {
  buildGiftCardEditModalSearch,
  buildGiftCardFiltersQuery,
  GIFT_CARD_FILTER_QUERY_KEYS,
} from "@/components/admin/admin-gift-cards-url";
import type { AdminGiftCardsListPayload } from "@/components/admin/admin-gift-cards-query";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";
import {
  adminGiftCardCapabilities,
  type GiftCardCapabilities,
} from "@/lib/backoffice-capabilities";

type AdminGiftCardsManagementProps = {
  initial: AdminGiftCardsListPayload;
  assignableUsers: readonly AdminAssignableUser[];
  locale: string;
  initialFilters: GiftCardFilterValues;
  variant?: "full" | "staff";
  staffBanner?: string;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: GiftCardCapabilities;
};

const SEARCH_DEBOUNCE_MS = 300;

export function AdminGiftCardsManagement({
  initial,
  assignableUsers,
  locale,
  initialFilters,
  variant = "full",
  staffBanner,
  readOnly = false,
  capabilities,
}: AdminGiftCardsManagementProps) {
  const caps =
    capabilities ??
    (readOnly
      ? {
          ...adminGiftCardCapabilities(),
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canAssign: false,
          canActivate: false,
          canDeactivate: false,
          canResend: false,
        }
      : adminGiftCardCapabilities());
  const isStaff = variant === "staff";
  const effectiveReadOnly = !caps.canUpdate;
  const t = useTranslations("adminPages.giftCards");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams.toString());
  const filtersRef = useRef(initialFilters);
  const hasMounted = useRef(false);
  const [filters, setFilters] = useState<GiftCardFilterValues>(initialFilters);
  const [selectedGiftCardId, setSelectedGiftCardId] = useState<string | null>(null);
  const [isDebouncingSearch, setIsDebouncingSearch] = useState(false);
  const [isPending, startTransition] = useTransition();
  const giftCards = initial.items;

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const selectedGiftCard = useMemo(() => {
    if (selectedGiftCardId === null) {
      return null;
    }
    return giftCards.find((card) => card.id === selectedGiftCardId) ?? null;
  }, [giftCards, selectedGiftCardId]);

  const activeFilterCount = countActiveGiftCardFilters(filters);
  const isUpdating = isDebouncingSearch || isPending;

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const currentQuery = buildGiftCardFiltersQuery(filtersRef.current);
    const urlQuery = buildGiftCardFiltersQuery(initialFilters);
    if (currentQuery !== urlQuery) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const syncFiltersToUrl = useCallback(
    (values: GiftCardFilterValues, resetPage = false) => {
      const currentSearchParams = searchParamsRef.current;
      const params = new URLSearchParams(currentSearchParams);
      for (const key of GIFT_CARD_FILTER_QUERY_KEYS) {
        params.delete(key);
      }
      if (resetPage) {
        resetListPageQuery(params);
      }
      const filterQuery = buildGiftCardFiltersQuery(values);
      if (filterQuery.length > 0) {
        for (const [key, entryValue] of new URLSearchParams(filterQuery)) {
          params.set(key, entryValue);
        }
      }
      const qs = params.toString();
      if (qs === currentSearchParams) {
        return;
      }
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, startTransition],
  );

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParamsRef.current);
      syncListPageQuery(params, page, pageSize);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, startTransition],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    setIsDebouncingSearch(true);
    const handle = window.setTimeout(() => {
      syncFiltersToUrl(filtersRef.current, true);
      setIsDebouncingSearch(false);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(handle);
      setIsDebouncingSearch(false);
    };
  }, [filters.search, syncFiltersToUrl]);

  useEffect(() => {
    if (!hasMounted.current) {
      return;
    }
    syncFiltersToUrl(filtersRef.current, true);
  }, [
    filters.status,
    filters.expiration,
    filters.amountMin,
    filters.amountMax,
    filters.order,
    filters.quick,
    syncFiltersToUrl,
  ]);

  function updateFilter<K extends keyof GiftCardFilterValues>(
    key: K,
    value: GiftCardFilterValues[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
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
    syncFiltersToUrl(cleared, true);
  }

  const selectGiftCard = useCallback((card: AdminGiftCardBatchRow) => {
    setSelectedGiftCardId(card.id);
  }, []);

  const closeGiftCardDetails = useCallback(() => {
    setSelectedGiftCardId(null);
  }, []);

  const handleChanged = useCallback(() => {
    router.refresh();
  }, [router]);

  const openEditModal = useCallback(
    (batchId: string) => {
      setSelectedGiftCardId(null);
      const qs = buildGiftCardEditModalSearch(searchParamsRef.current, batchId);
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [pathname, router],
  );

  return (
    <AdminGiftCardsShell
      assignableUsers={assignableUsers}
      giftCards={giftCards}
      variant={variant}
      staffBanner={staffBanner}
      readOnly={effectiveReadOnly || isStaff}
      filterProps={{
        values: filters,
        activeFilterCount,
        isUpdating,
        onChange: updateFilter,
        onReset: resetFilters,
      }}
    >
      {giftCards.length === 0 ? <p className="text-sm text-sage-500">{t("empty")}</p> : null}
      {giftCards.length > 0 ? (
        <>
          <AdminGiftCardsDirectory
            cards={giftCards}
            locale={locale}
            readOnly={effectiveReadOnly || isStaff}
            onSelect={selectGiftCard}
            onEdit={openEditModal}
            onChanged={handleChanged}
          />
          <OmmListPagination
            total={initial.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={initial.offset}
            onPageChange={setListPage}
            disabled={isUpdating}
          />
        </>
      ) : null}

      <AdminGiftCardDetailsSheet
        card={selectedGiftCard}
        locale={locale}
        assignableUsers={assignableUsers}
        readOnly={effectiveReadOnly || isStaff}
        capabilities={caps}
        onClose={closeGiftCardDetails}
        onChanged={handleChanged}
      />
    </AdminGiftCardsShell>
  );
}
