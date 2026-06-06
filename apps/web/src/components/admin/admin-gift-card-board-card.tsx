"use client";

import { useTranslations } from "next-intl";
import {
  displayGiftCardDate,
  giftCardQuantityLabel,
  giftCardStatusBadgeClass,
} from "@/components/admin/admin-gift-card-display-helpers";
import { AdminGiftCardRowActions } from "@/components/admin/admin-gift-card-row-actions";
import { recipientLabel } from "@/components/admin/admin-gift-cards-filter-logic";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { GiftCardThumbnail } from "@/components/gift-cards/gift-card-thumbnail";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminGiftCardBoardCardProps = {
  card: AdminGiftCardBatchRow;
  locale: string;
  busyBatchId: string | null;
  onOpenActions: (card: AdminGiftCardBatchRow) => void;
  onEdit: (batchId: string) => void;
  onChanged?: () => void;
};

export function AdminGiftCardBoardCard({
  card,
  locale,
  busyBatchId,
  onOpenActions,
  onEdit,
  onChanged,
}: AdminGiftCardBoardCardProps) {
  const t = useTranslations("adminPages.giftCards");

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("openCardAria", {
        amount: formatAmdFromCents(card.amountAmd, locale),
      })}
      onClick={() => onOpenActions(card)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenActions(card);
        }
      }}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_44px_-22px_rgba(45,40,35,0.28)] transition-all hover:-translate-y-0.5 hover:border-sand-500/30 hover:shadow-[0_26px_52px_-22px_rgba(45,40,35,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <div className="p-4 pb-3">
        <div className="overflow-hidden rounded-[20px] border border-white/90 bg-white shadow-[0_16px_36px_-18px_rgba(45,40,35,0.32)]">
          <div className="relative aspect-[1.62/1] w-full bg-gradient-to-br from-sand-50 via-paper to-mint-50">
            <GiftCardThumbnail
              imageUrl={card.imageUrl}
              alt={t("cardImageAlt")}
              fallbackLabel={t("cardImageFallback")}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif text-2xl font-normal text-sage-900">
            {formatAmdFromCents(card.amountAmd, locale)}
          </p>
          <span className={`${giftCardStatusBadgeClass(card.status)} shrink-0 font-semibold uppercase tracking-wide`}>
            {t(`statusValues.${card.status}`)}
          </span>
        </div>

        <dl className="grid gap-2.5 text-sm">
          <GiftCardDetailRow label={t("colCreated")} value={displayGiftCardDate(card.createdAt)} />
          <GiftCardDetailRow label={t("colExpiration")} value={displayGiftCardDate(card.expiresAt)} />
          <GiftCardDetailRow label={t("colRecipient")} value={recipientLabel(card) || "—"} />
          <GiftCardDetailRow label={t("colAvailableQuantity")} value={giftCardQuantityLabel(card)} />
        </dl>

        <AdminGiftCardRowActions
          variant="board"
          card={card}
          busyBatchId={busyBatchId}
          onEdit={onEdit}
          onOpenActions={onOpenActions}
          showOpenActionsLink={false}
          onChanged={onChanged}
        />
      </div>
    </article>
  );
}

function GiftCardDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-sand-500/10 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">{label}</dt>
      <dd className="truncate text-right font-medium text-sage-800">{value}</dd>
    </div>
  );
}
