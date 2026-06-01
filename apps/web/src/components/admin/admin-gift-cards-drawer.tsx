"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminGiftCardActions } from "@/components/admin/admin-gift-card-actions";
import {
  isGiftCardExpired,
  purchaserLabel,
  recipientLabel,
} from "@/components/admin/admin-gift-cards-filter-logic";
import type { AdminGiftCardRow } from "@/components/admin/admin-gift-cards-types";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminGiftCardDrawerProps = {
  card: AdminGiftCardRow | null;
  locale: string;
  onClose: () => void;
  onChanged: () => void;
};

function displayDate(value: string | null, locale: string): string {
  if (value === null) {
    return "—";
  }
  const formatted = formatDateForUi(value);
  return formatted.length > 0 ? formatted : "—";
}

export function AdminGiftCardDrawer({
  card,
  locale,
  onClose,
  onChanged,
}: AdminGiftCardDrawerProps) {
  const t = useTranslations("adminPages.giftCards");

  useEffect(() => {
    if (card === null) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [card, onClose]);

  if (card === null || typeof document === "undefined") {
    return null;
  }

  const recipient = recipientLabel(card);
  const expired = isGiftCardExpired(card);

  return createPortal(
    <div className="ommm-drawer-overlay z-40">
      <button type="button" className="ommm-modal-backdrop" onClick={onClose} aria-label={t("drawerClose")} />
      <aside className="relative z-10 h-full w-full max-w-md overflow-y-auto border-l border-white/60 bg-white/95 p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-semibold text-sage-900">
              {formatAmdFromCents(card.amountCents, locale)}
            </h3>
            <p className="mt-1 font-mono text-xs text-sage-500">{card.code}</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-sage-500 hover:bg-sage-50"
            onClick={onClose}
            aria-label={t("drawerClose")}
          >
            ×
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <DetailRow label={t("colPurchaser")} value={purchaserLabel(card)} />
          <DetailRow
            label={t("colRecipient")}
            value={recipient.length > 0 ? recipient : "—"}
          />
          <DetailRow label={t("colAmount")} value={formatAmdFromCents(card.amountCents, locale)} />
          <DetailRow
            label={t("colBalance")}
            value={formatAmdFromCents(card.balanceCents, locale)}
          />
          <DetailRow label={t("colStatus")} value={t(`statusValues.${card.status}`)} />
          <DetailRow label={t("colCreated")} value={displayDate(card.createdAt, locale)} />
          <DetailRow label={t("colExpiration")} value={displayDate(card.expiresAt, locale)} />
          {card.expiresAt !== null ? (
            <DetailRow
              label={t("drawerExpirationState")}
              value={expired ? t("drawerExpired") : t("drawerValid")}
            />
          ) : null}
          {card.message ? (
            <DetailRow label={t("fieldMessage")} value={card.message} />
          ) : null}
        </dl>

        <div className="mt-6 border-t border-white/60 pt-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-sage-500">{t("colActions")}</p>
          <AdminGiftCardActions
            giftCardId={card.id}
            allowDeactivate={card.status === "ACTIVE"}
            onChanged={onChanged}
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-sage-500">{label}</dt>
      <dd className="mt-1 text-sage-800">{value}</dd>
    </div>
  );
}
