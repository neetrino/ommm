"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminGiftCardActions } from "@/components/admin/admin-gift-card-actions";
import { AdminGiftIssuedCards } from "@/components/admin/admin-gift-issued-cards";
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
import { useGiftCardValueLabel } from "@/components/admin/admin-gift-card-value";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { GiftCardFace } from "@/components/gift-cards/gift-card-face";
import {
  DetailsCard,
  DetailsField,
  DetailsFieldRow,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  ClockGlyph,
  GiftGlyph,
  NoteGlyph,
  TicketGlyph,
  UserGlyph,
  WalletGlyph,
} from "@/components/shared/details/details-glyphs";

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
  const recipient = recipientLabel(card);
  const expired = isGiftCardExpired(card);
  const amountLabel = useGiftCardValueLabel(card, locale);

  return (
    <div className="space-y-4">
      <section className={`${SECTION_CLASS} overflow-hidden`}>
        <GiftCardFace alt={t("cardImageAlt")} className="aspect-[1.58/1] w-full" />
        <div className="flex flex-wrap items-center gap-2 border-t border-white/60 px-4 py-3">
          <span className={giftCardStatusBadgeClass(card.status)}>
            {t(`statusValues.${card.status}`)}
          </span>
          {card.expiresAt !== null ? (
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                expired
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-mint-200 bg-mint-100 text-sage-900"
              }`}
            >
              {expired ? t("drawerExpired") : t("drawerValid")}
            </span>
          ) : null}
        </div>
      </section>

      <DetailsCard title={t("detailsModalInfoHeading")} icon={<GiftGlyph />}>
        <DetailsStatStrip columns={2}>
          <DetailsStat label={t("colAmount")} icon={<WalletGlyph />} tone="mint">
            <span className="font-serif text-lg">{amountLabel}</span>
          </DetailsStat>
          <DetailsStat label={t("colAvailableQuantity")} icon={<TicketGlyph />} tone="peach">
            {giftCardQuantityLabel(card)}
          </DetailsStat>
        </DetailsStatStrip>
        <DetailsFieldRow>
          <DetailsField label={t("colPurchaser")} icon={<UserGlyph />} title={purchaserLabel(card)}>
            {purchaserLabel(card)}
          </DetailsField>
          <DetailsField label={t("colRecipient")} icon={<UserGlyph />} title={recipient}>
            {recipient.length > 0 ? recipient : "—"}
          </DetailsField>
          <DetailsField label={t("colCreated")} icon={<CalendarGlyph />}>
            {displayGiftCardDate(card.createdAt)}
          </DetailsField>
          <DetailsField label={t("colExpiration")} icon={<ClockGlyph />}>
            {displayGiftCardDate(card.expiresAt)}
          </DetailsField>
          {card.message ? (
            <DetailsField label={t("fieldMessage")} icon={<NoteGlyph />} wide multiline>
              {card.message}
            </DetailsField>
          ) : null}
        </DetailsFieldRow>
      </DetailsCard>
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
    <>
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
      <AdminGiftIssuedCards batchId={card.id} locale={locale} onChanged={onChanged} />
    </>
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
    return <p className="text-sm text-sage-500">{t("historyLoading")}</p>;
  }

  if (error !== null) {
    return <p className="text-sm text-red-800" role="alert">{error}</p>;
  }

  if (history === null) {
    return <p className="text-sm text-sage-500">{t("historyEmpty")}</p>;
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
            <li key={`${event.type}-${event.at}-${event.description}`}>
              {formatDateForUi(event.at)} — {event.description}
            </li>
          ))
        )}
      </ul>
      {history.note ? <p className="mt-3 text-sage-500">{history.note}</p> : null}
    </div>
  );
}