"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminGiftCardActions } from "@/components/admin/admin-gift-card-actions";
import {
  displayGiftCardDate,
  giftCardQuantityLabel,
  giftCardStatusBadgeClass,
} from "@/components/admin/admin-gift-card-display-helpers";
import {
  GIFT_CARD_SHEET_TAB_ACTIONS,
  GIFT_CARD_SHEET_TAB_HISTORY,
  GIFT_CARD_SHEET_TAB_OVERVIEW,
} from "@/components/admin/admin-gift-card-sheet-tabs";
import {
  isGiftCardExpired,
  purchaserLabel,
  recipientLabel,
} from "@/components/admin/admin-gift-cards-filter-logic";
import type {
  AdminAssignableUser,
  AdminGiftCardBatchRow,
  AdminGiftCardRedemptionHistory,
} from "@/components/admin/admin-gift-cards-types";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

const SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)]";

type GiftCardSheetTabPanelsProps = {
  activeTab: string;
  card: AdminGiftCardBatchRow;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  onChanged: () => void;
  onRemoved?: () => void;
  readOnly?: boolean;
  canDelete?: boolean;
  canAssign?: boolean;
};

export function GiftCardSheetTabPanels({
  activeTab,
  card,
  locale,
  assignableUsers,
  onChanged,
  onRemoved,
  readOnly = false,
  canDelete = true,
  canAssign = true,
}: GiftCardSheetTabPanelsProps) {
  if (activeTab === GIFT_CARD_SHEET_TAB_OVERVIEW) {
    return <GiftCardOverviewPanel card={card} locale={locale} />;
  }

  if (activeTab === GIFT_CARD_SHEET_TAB_ACTIONS) {
    if (readOnly) {
      return null;
    }
    return (
      <GiftCardActionsPanel
        card={card}
        locale={locale}
        assignableUsers={assignableUsers}
        canDelete={canDelete}
        canAssign={canAssign}
        onChanged={onChanged}
        onRemoved={onRemoved}
      />
    );
  }

  if (activeTab === GIFT_CARD_SHEET_TAB_HISTORY) {
    return <GiftCardHistoryPanel key={card.id} batchId={card.id} locale={locale} />;
  }

  return null;
}

function GiftCardOverviewPanel({
  card,
  locale,
}: {
  card: AdminGiftCardBatchRow;
  locale: string;
}) {
  const t = useTranslations("adminPages.giftCards");
  const resolvedImage = resolveApiAssetUrl(card.imageUrl);
  const recipient = recipientLabel(card);
  const expired = isGiftCardExpired(card);
  const amountLabel = formatAmdFromCents(card.amountAmd, locale);

  return (
    <div className="space-y-4">
      <section className={`${SECTION_CLASS} overflow-hidden`}>
        <div className="flex w-full items-center justify-center bg-sage-100 p-4">
          {resolvedImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
            <img
              src={resolvedImage}
              alt={t("cardImageAlt")}
              className="h-auto max-h-[min(40vh,320px)] w-full object-contain"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-sand-100 via-paper to-mint-100 sm:h-48">
              <span className="text-sm font-medium text-sage-600">{t("cardImageFallback")}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-white/60 px-4 py-3">
          <span className={giftCardStatusBadgeClass(card.status)}>
            {t(`statusValues.${card.status}`)}
          </span>
          {card.expiresAt !== null ? (
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                expired
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-mint-200 bg-mint-50 text-sage-900"
              }`}
            >
              {expired ? t("drawerExpired") : t("drawerValid")}
            </span>
          ) : null}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label={t("colAmount")} value={amountLabel} />
        <MetricCard label={t("colAvailableQuantity")} value={giftCardQuantityLabel(card)} />
      </div>

      <section className={`${SECTION_CLASS} p-4 sm:p-5`}>
        <p className="font-medium text-sage-900">{t("detailsModalInfoHeading")}</p>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <DetailField label={t("colPurchaser")} value={purchaserLabel(card)} />
          <DetailField
            label={t("colRecipient")}
            value={recipient.length > 0 ? recipient : "—"}
          />
          <DetailField label={t("colCreated")} value={displayGiftCardDate(card.createdAt)} />
          <DetailField label={t("colExpiration")} value={displayGiftCardDate(card.expiresAt)} />
          {card.message ? (
            <DetailField label={t("fieldMessage")} value={card.message} className="sm:col-span-2" />
          ) : null}
        </dl>
      </section>
    </div>
  );
}

function GiftCardActionsPanel({
  card,
  locale,
  assignableUsers,
  canDelete = true,
  canAssign = true,
  onChanged,
  onRemoved,
}: {
  card: AdminGiftCardBatchRow;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  canDelete?: boolean;
  canAssign?: boolean;
  onChanged: () => void;
  onRemoved?: () => void;
}) {
  return (
    <AdminGiftCardActions
      batchId={card.id}
      allowDeactivate={false}
      allowDelete={canDelete}
      hideLifecycleActions
      showHistoryButton={false}
      hideAssign={!canAssign}
      locale={locale}
      assignableUsers={assignableUsers}
      onChanged={onChanged}
      onRemoved={onRemoved}
    />
  );
}

function GiftCardHistoryPanel({ batchId, locale }: { batchId: string; locale: string }) {
  const t = useTranslations("adminPages.giftCards.actions");
  const [history, setHistory] = useState<AdminGiftCardRedemptionHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void apiFetch<AdminGiftCardRedemptionHistory>(`/gift-cards/admin/batches/${batchId}/history`)
      .then((result) => {
        if (!cancelled) {
          setHistory(result);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError instanceof ApiError ? fetchError.message : t("failed"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, t]);

  if (loading) {
    return <p className="text-sm text-sage-600">{t("historyLoading")}</p>;
  }

  if (error !== null) {
    return <p className="text-sm text-red-800" role="alert">{error}</p>;
  }

  if (history === null) {
    return <p className="text-sm text-sage-600">{t("historyEmpty")}</p>;
  }

  return (
    <div className={`${SECTION_CLASS} p-4 text-sm text-sage-700 sm:p-5`}>
      <p className="font-medium text-sage-900">{t("historyTitle")}</p>
      {history.amountAmd !== undefined && history.balanceAmd !== undefined ? (
        <p className="mt-2">
          {t("historySummary", {
            amount: formatAmdFromCents(history.amountAmd, locale),
            balance: formatAmdFromCents(history.balanceAmd, locale),
          })}
        </p>
      ) : null}
      {history.totalQuantity !== undefined && history.availableQuantity !== undefined ? (
        <p className="mt-2">
          {t("historyInventorySummary", {
            available: history.availableQuantity,
            total: history.totalQuantity,
            issued: history.issuedCount ?? history.totalQuantity - history.availableQuantity,
            redeemed: history.redeemedCount ?? 0,
          })}
        </p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {history.events.length === 0 ? (
          <li className="text-sage-500">{t("historyEmpty")}</li>
        ) : (
          history.events.map((event) => (
            <li key={`${event.type}-${event.at}`}>
              {formatDateForUi(event.at)} — {event.description}
            </li>
          ))
        )}
      </ul>
      {history.note ? <p className="mt-3 text-sage-500">{history.note}</p> : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={adminChrome.metricCard}>
      <p className={adminChrome.metricLabel}>{label}</p>
      <p className={adminChrome.metricValue}>{value}</p>
    </div>
  );
}

function DetailField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-sage-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-sage-800">{value}</dd>
    </div>
  );
}
