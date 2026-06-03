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
import { AdminGiftCardDetailsModal } from "@/components/admin/admin-gift-card-details-modal";
import { AdminGiftCardsDirectory } from "@/components/admin/admin-gift-cards-directory";
import { ApiError, apiFetch } from "@/lib/api";
import {
  countActiveGiftCardFilters,
  filterGiftCards,
  sortGiftCards,
} from "@/components/admin/admin-gift-cards-filter-logic";
import { AdminGiftCardsFilters } from "@/components/admin/admin-gift-cards-filters";
import { AdminGiftCardsShell } from "@/components/admin/admin-gift-cards-shell";
import type {
  AdminAssignableUser,
  AdminGiftCardBatchRow,
  GiftCardFilterValues,
} from "@/components/admin/admin-gift-cards-types";
import {
  buildGiftCardFiltersQuery,
  GIFT_CARD_FILTER_QUERY_KEYS,
} from "@/components/admin/admin-gift-cards-url";
import type { AdminGiftCardsViewMode } from "@/lib/admin-gift-cards-view-preference";

type AdminGiftCardsManagementProps = {
  giftCards: readonly AdminGiftCardBatchRow[];
  assignableUsers: readonly AdminAssignableUser[];
  locale: string;
  initialFilters: GiftCardFilterValues;
  initialViewMode: AdminGiftCardsViewMode;
};

const SEARCH_DEBOUNCE_MS = 300;
const MODAL_QUERY_KEY = "modal";
const EDIT_MODAL_QUERY_VALUE = "edit-gift-card";

export function AdminGiftCardsManagement({
  giftCards,
  assignableUsers,
  locale,
  initialFilters,
  initialViewMode,
}: AdminGiftCardsManagementProps) {
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
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const selectedGiftCard = useMemo(() => {
    if (selectedGiftCardId === null) {
      return null;
    }
    return giftCards.find((card) => card.id === selectedGiftCardId) ?? null;
  }, [giftCards, selectedGiftCardId]);

  const filtered = useMemo(
    () => sortGiftCards(filterGiftCards(giftCards, filters), filters.order),
    [filters, giftCards],
  );

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
    (values: GiftCardFilterValues) => {
      const currentSearchParams = searchParamsRef.current;
      const params = new URLSearchParams(currentSearchParams);
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
      if (qs === currentSearchParams) {
        return;
      }
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
      syncFiltersToUrl(filtersRef.current);
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
    syncFiltersToUrl(filtersRef.current);
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
    syncFiltersToUrl(cleared);
  }

  const openGiftCardDetails = useCallback((card: AdminGiftCardBatchRow) => {
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
      const params = new URLSearchParams(searchParamsRef.current);
      params.set(MODAL_QUERY_KEY, EDIT_MODAL_QUERY_VALUE);
      params.set("batchId", batchId);
      const qs = params.toString();
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [pathname, router],
  );

  const deleteBatch = useCallback(
    async (batchId: string) => {
      if (busyBatchId !== null) {
        return;
      }
      if (!window.confirm(t("actions.deleteConfirm"))) {
        return;
      }
      setBusyBatchId(batchId);
      setFeedback(null);
      try {
        await apiFetch(`/gift-cards/admin/batches/${batchId}`, { method: "DELETE" });
        setFeedback({ tone: "ok", text: t("actions.deleted") });
        if (selectedGiftCardId === batchId) {
          setSelectedGiftCardId(null);
        }
        router.refresh();
      } catch (error) {
        setFeedback({
          tone: "err",
          text: error instanceof ApiError ? error.message : t("actions.failed"),
        });
      } finally {
        setBusyBatchId(null);
      }
    },
    [busyBatchId, router, selectedGiftCardId, t],
  );

  return (
    <AdminGiftCardsShell
      assignableUsers={assignableUsers}
      giftCards={giftCards}
      initialViewMode={initialViewMode}
    >
      <AdminGiftCardsFilters
        values={filters}
        activeFilterCount={activeFilterCount}
        isUpdating={isUpdating}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      {feedback ? (
        <p
          className={`text-sm ${feedback.tone === "ok" ? "text-sage-700" : "text-red-800"}`}
          role="status"
        >
          {feedback.text}
        </p>
      ) : null}

      {filtered.length === 0 ? <p className="text-sm text-sage-500">{t("empty")}</p> : null}
      {filtered.length > 0 ? (
        <AdminGiftCardsDirectory
          cards={filtered}
          locale={locale}
          busyBatchId={busyBatchId}
          onOpenActions={openGiftCardDetails}
          onEdit={openEditModal}
          onDelete={(batchId) => void deleteBatch(batchId)}
          onChanged={handleChanged}
        />
      ) : null}

      <AdminGiftCardDetailsModal
        card={selectedGiftCard}
        locale={locale}
        assignableUsers={assignableUsers}
        onClose={closeGiftCardDetails}
        onChanged={handleChanged}
      />
    </AdminGiftCardsShell>
  );
}
