"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  displayGiftCardDate,
  giftCardQuantityLabel,
  giftCardStatusBadgeClass,
} from "@/components/admin/admin-gift-card-display-helpers";
import { AdminGiftCardRowActions } from "@/components/admin/admin-gift-card-row-actions";
import { recipientLabel } from "@/components/admin/admin-gift-cards-filter-logic";
import { useAdminGiftCardsView } from "@/components/admin/admin-gift-cards-view-context";
import { useEffectiveListBoardViewMode } from "@/hooks/use-effective-list-board-view-mode";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { GiftCardThumbnail } from "@/components/gift-cards/gift-card-thumbnail";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminGiftCardsDirectoryProps = {
  cards: readonly AdminGiftCardBatchRow[];
  locale: string;
  busyBatchId: string | null;
  onOpenActions: (card: AdminGiftCardBatchRow) => void;
  onEdit: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  onChanged?: () => void;
};

function AdminGiftCardThumbnail({
  card,
  className,
}: {
  card: AdminGiftCardBatchRow;
  className?: string;
}) {
  const t = useTranslations("adminPages.giftCards");
  return (
    <GiftCardThumbnail
      imageUrl={card.imageUrl}
      alt={t("cardImageAlt")}
      fallbackLabel={t("cardImageFallback")}
      className={className}
    />
  );
}

function AdminGiftCardsBoardView({
  cards,
  locale,
  busyBatchId,
  onOpenActions,
  onEdit,
  onDelete,
  onChanged,
}: AdminGiftCardsDirectoryProps) {
  const t = useTranslations("adminPages.giftCards");

  function openCardDetails(card: AdminGiftCardBatchRow) {
    onOpenActions(card);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.id}
          role="button"
          tabIndex={0}
          aria-label={t("openCardAria", {
            amount: formatAmdFromCents(card.amountAmd, locale),
          })}
          onClick={() => openCardDetails(card)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openCardDetails(card);
            }
          }}
          className="cursor-pointer overflow-hidden rounded-3xl border border-white/65 bg-white/85 shadow-[0_18px_40px_-24px_rgba(45,40,35,0.28)] transition-all hover:-translate-y-0.5 hover:border-white/80 hover:shadow-[0_22px_48px_-24px_rgba(45,40,35,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <div className="relative aspect-[16/9] w-full bg-sage-100">
            <AdminGiftCardThumbnail card={card} />
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-sage-900">
                {formatAmdFromCents(card.amountAmd, locale)}
              </p>
              <span className={giftCardStatusBadgeClass(card.status)}>
                {t(`statusValues.${card.status}`)}
              </span>
            </div>
            <dl className="grid gap-1 text-sm text-sage-700">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-sage-500">{t("colCreated")}</dt>
                <dd>{displayGiftCardDate(card.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-sage-500">{t("colExpiration")}</dt>
                <dd>{displayGiftCardDate(card.expiresAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-sage-500">{t("colRecipient")}</dt>
                <dd className="truncate">{recipientLabel(card) || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-sage-500">{t("colAvailableQuantity")}</dt>
                <dd>{giftCardQuantityLabel(card)}</dd>
              </div>
            </dl>
            <AdminGiftCardRowActions
              card={card}
              busyBatchId={busyBatchId}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenActions={onOpenActions}
              showOpenActionsLink={false}
              onChanged={onChanged}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function AdminGiftCardsListView({
  cards,
  locale,
  busyBatchId,
  onOpenActions,
  onEdit,
  onDelete,
  onChanged,
}: AdminGiftCardsDirectoryProps) {
  const t = useTranslations("adminPages.giftCards");

  return (
    <div className={adminChrome.tableWrap}>
      <table className={`${adminChrome.table} table-fixed min-w-[56rem]`}>
        <colgroup>
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[30%]" />
        </colgroup>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th}>{t("colImage")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colAmount")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colStatus")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colCreated")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colExpiration")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colAvailableQuantity")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => {
            const rowDivider =
              index < cards.length - 1 ? adminChrome.tableRowDivider : "";

            return (
              <tr key={card.id}>
                <td className={`${adminChrome.td} ${rowDivider}`}>
                  <div className="h-14 w-20 overflow-hidden rounded-xl border border-white/60 bg-sage-100">
                    <AdminGiftCardThumbnail card={card} className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className={`${adminChrome.tdStrong} text-center ${rowDivider}`}>
                  {formatAmdFromCents(card.amountAmd, locale)}
                </td>
                <td className={`${adminChrome.td} text-center ${rowDivider}`}>
                  <span className={giftCardStatusBadgeClass(card.status)}>
                    {t(`statusValues.${card.status}`)}
                  </span>
                </td>
                <td className={`${adminChrome.td} text-center ${rowDivider}`}>
                  {displayGiftCardDate(card.createdAt)}
                </td>
                <td className={`${adminChrome.td} text-center ${rowDivider}`}>
                  {displayGiftCardDate(card.expiresAt)}
                </td>
                <td className={`${adminChrome.td} text-center ${rowDivider}`}>
                  {giftCardQuantityLabel(card)}
                </td>
                <td className={`${adminChrome.td} text-center ${rowDivider}`}>
                  <AdminGiftCardRowActions
                    card={card}
                    busyBatchId={busyBatchId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onOpenActions={onOpenActions}
                    onChanged={onChanged}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AdminGiftCardsDirectory(props: AdminGiftCardsDirectoryProps) {
  const { viewMode: preferredViewMode } = useAdminGiftCardsView();
  const viewMode = useEffectiveListBoardViewMode(preferredViewMode);

  if (viewMode === "board") {
    return <AdminGiftCardsBoardView {...props} />;
  }

  return <AdminGiftCardsListView {...props} />;
}
