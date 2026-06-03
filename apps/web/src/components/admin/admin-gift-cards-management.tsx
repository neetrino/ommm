"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminGiftCardDrawer } from "@/components/admin/admin-gift-cards-drawer";
import { ApiError, apiFetch } from "@/lib/api";
import {
  countActiveGiftCardFilters,
  filterGiftCards,
  recipientLabel,
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
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminGiftCardsManagementProps = {
  giftCards: readonly AdminGiftCardBatchRow[];
  assignableUsers: readonly AdminAssignableUser[];
  locale: string;
  initialFilters: GiftCardFilterValues;
};

const SEARCH_DEBOUNCE_MS = 300;
const MODAL_QUERY_KEY = "modal";
const MODAL_QUERY_VALUE = "create-gift-card";
const EDIT_MODAL_QUERY_VALUE = "edit-gift-card";

function displayDate(value: string | null): string {
  if (value === null) {
    return "—";
  }
  const formatted = formatDateForUi(value);
  return formatted.length > 0 ? formatted : "—";
}

export function AdminGiftCardsManagement({
  giftCards,
  assignableUsers,
  locale,
  initialFilters,
}: AdminGiftCardsManagementProps) {
  const t = useTranslations("adminPages.giftCards");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams.toString());
  const hasMounted = useRef(false);
  const [filters, setFilters] = useState<GiftCardFilterValues>(initialFilters);
  const [selected, setSelected] = useState<AdminGiftCardBatchRow | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const filtered = useMemo(
    () => sortGiftCards(filterGiftCards(giftCards, filters), filters.order),
    [filters, giftCards],
  );

  const activeFilterCount = countActiveGiftCardFilters(filters);

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

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
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

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
  }, [filters.search, filters, syncFiltersToUrl]);

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

  function handleChanged() {
    setSelected(null);
    router.refresh();
  }

  const openEditModal = useCallback(
    (batchId: string) => {
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
        if (selected?.id === batchId) {
          setSelected(null);
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
    [busyBatchId, router, selected?.id, t],
  );

  return (
    <AdminGiftCardsShell assignableUsers={assignableUsers} giftCards={giftCards}>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((card) => {
            const resolvedImage = resolveApiAssetUrl(card.imageUrl);
            const available = `${card.availableQuantity} / ${card.totalQuantity}`;
            return (
              <article
                key={card.id}
                className="overflow-hidden rounded-3xl border border-white/65 bg-white/85 shadow-[0_18px_40px_-24px_rgba(45,40,35,0.28)]"
              >
                <div className="relative aspect-[16/9] w-full bg-sage-100">
                  {resolvedImage ? (
                    // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
                    <img src={resolvedImage} alt={t("cardImageAlt")} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand-100 via-paper to-mint-100">
                      <span className="text-sm font-medium text-sage-600">{t("cardImageFallback")}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-sage-900">
                      {formatAmdFromCents(card.amountCents, locale)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={statusBadgeClass(card.status)}>{t(`statusValues.${card.status}`)}</span>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-sage-200 bg-white text-sage-700 shadow-sm transition-all hover:-translate-y-px hover:bg-sage-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                        aria-label={t("editTitle")}
                        title={t("editTitle")}
                        onClick={() => openEditModal(card.id)}
                        disabled={busyBatchId !== null}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-red-200 bg-white text-red-700 shadow-sm transition-all hover:-translate-y-px hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={t("actions.delete")}
                        title={t("actions.delete")}
                        onClick={() => void deleteBatch(card.id)}
                        disabled={busyBatchId !== null}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <dl className="grid gap-1 text-sm text-sage-700">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-sage-500">{t("colCreated")}</dt>
                      <dd>{displayDate(card.createdAt)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-sage-500">{t("colExpiration")}</dt>
                      <dd>{displayDate(card.expiresAt)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-sage-500">{t("colRecipient")}</dt>
                      <dd className="truncate">{recipientLabel(card) || "—"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-sage-500">{t("colAvailableQuantity")}</dt>
                      <dd>{available}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="text-left text-sm text-sage-700 underline-offset-2 hover:underline"
                    onClick={() => setSelected(card)}
                  >
                    {t("openActions")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <AdminGiftCardDrawer
        card={selected}
        locale={locale}
        assignableUsers={assignableUsers}
        onClose={() => setSelected(null)}
        onChanged={handleChanged}
      />
    </AdminGiftCardsShell>
  );
}

function statusBadgeClass(status: AdminGiftCardBatchRow["status"]): string {
  if (status === "ACTIVE") {
    return "inline-flex rounded-full border border-mint-200 bg-mint-50 px-2 py-0.5 text-xs text-sage-900";
  }
  if (status === "REDEEMED") {
    return "inline-flex rounded-full border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs text-sage-900";
  }
  if (status === "DEACTIVATED") {
    return "inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700";
  }
  return "inline-flex rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs text-sage-700";
}
