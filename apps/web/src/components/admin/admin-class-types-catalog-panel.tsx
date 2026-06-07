"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { AdminClassTypeRow } from "@/components/admin/admin-class-types-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { ADMIN_DETAILS_SHEET_BODY_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { formatDateForUi } from "@/lib/date-display";

const LIST_SEARCH_MIN_COUNT = 6;

type LoadState = "idle" | "loading" | "error";

type AdminClassTypesCatalogPanelProps = {
  types: readonly AdminClassTypeRow[];
  filteredTypes: readonly AdminClassTypeRow[];
  listFilter: string;
  onListFilterChange: (value: string) => void;
  loadState: LoadState;
  listError: string | null;
  resolvedSessionCounts: Readonly<Record<string, number>>;
  toastMessage: string | null;
  toastTone: "ok" | "err";
  onToastDismiss: () => void;
  onRetry: () => void;
  onSelectType: (type: AdminClassTypeRow) => void;
};

function truncateDescription(value: string, max = 72): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function ListSkeleton() {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <li
          key={index}
          className="h-[4.5rem] animate-pulse rounded-2xl border border-white/70 bg-white/60"
        />
      ))}
    </ul>
  );
}

export function AdminClassTypesCatalogPanel({
  types,
  filteredTypes,
  listFilter,
  onListFilterChange,
  loadState,
  listError,
  resolvedSessionCounts,
  toastMessage,
  toastTone,
  onToastDismiss,
  onRetry,
  onSelectType,
}: AdminClassTypesCatalogPanelProps) {
  const t = useTranslations("adminPages.classes.classTypes");
  const showSearch = types.length >= LIST_SEARCH_MIN_COUNT;
  const listBusy = loadState === "loading";

  const searchPlaceholder = useMemo(() => t("listSearchPlaceholder"), [t]);

  return (
    <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
      {toastMessage ? (
        <AdminCenterToast message={toastMessage} tone={toastTone} onDismiss={onToastDismiss} />
      ) : null}
      <section className="flex min-h-0 flex-1 flex-col">
        {showSearch ? (
          <input
            className="ommm-input mb-3 h-9 text-sm"
            value={listFilter}
            onChange={(event) => onListFilterChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            disabled={listBusy}
          />
        ) : null}
        {loadState === "error" ? (
          <div className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-8 text-center">
            <p className="font-medium text-red-900">{t("loadErrorTitle")}</p>
            <p className="mt-1 text-sm text-red-800">{listError ?? t("messages.genericError")}</p>
            <OmmButton size="sm" variant="primary" className="mt-4" onClick={onRetry}>
              {t("retryButton")}
            </OmmButton>
          </div>
        ) : listBusy ? (
          <ListSkeleton />
        ) : types.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/80 bg-white/60 px-4 py-10 text-center">
            <p className="font-medium text-sage-800">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-sage-500">{t("emptyBody")}</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <p className="rounded-2xl border border-white/70 bg-white/60 px-4 py-8 text-center text-sm text-sage-500">
            {t("listNoMatches")}
          </p>
        ) : (
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredTypes.map((type) => {
              const count = resolvedSessionCounts[type.id] ?? 0;
              const description = type.description?.trim();
              const updatedLabel =
                type.updatedAt !== undefined ? formatDateForUi(type.updatedAt) : null;
              return (
                <li key={type.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-left text-sage-800 transition-colors hover:border-sage-700/15 hover:bg-white"
                    onClick={() => onSelectType(type)}
                    disabled={listBusy}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{type.name}</span>
                      {description ? (
                        <span className="mt-1 block text-sm line-clamp-2 text-sage-600">
                          {truncateDescription(description)}
                        </span>
                      ) : null}
                      <span className="mt-1.5 block text-xs text-sage-500">
                        {type.slug}
                        {" · "}
                        {count > 0 ? t("sessionCount", { count }) : t("sessionCountNone")}
                        {updatedLabel ? ` · ${t("updatedLabel", { date: updatedLabel })}` : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
