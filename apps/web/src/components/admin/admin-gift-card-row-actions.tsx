"use client";

import { useTranslations } from "next-intl";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";

type AdminGiftCardRowActionsProps = {
  card: AdminGiftCardBatchRow;
  busyBatchId: string | null;
  onEdit: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  onOpenActions: (card: AdminGiftCardBatchRow) => void;
};

export function AdminGiftCardRowActions({
  card,
  busyBatchId,
  onEdit,
  onDelete,
  onOpenActions,
}: AdminGiftCardRowActionsProps) {
  const t = useTranslations("adminPages.giftCards");
  const disabled = busyBatchId !== null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className="text-sm text-sage-700 underline-offset-2 hover:underline"
        onClick={() => onOpenActions(card)}
        disabled={disabled}
      >
        {t("openActions")}
      </button>
      <button
        type="button"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-sage-200 bg-white text-sage-700 shadow-sm transition-all hover:-translate-y-px hover:bg-sage-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={t("editTitle")}
        title={t("editTitle")}
        onClick={() => onEdit(card.id)}
        disabled={disabled}
      >
        <EditGlyph />
      </button>
      <button
        type="button"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-red-200 bg-white text-red-700 shadow-sm transition-all hover:-translate-y-px hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={t("actions.delete")}
        title={t("actions.delete")}
        onClick={() => onDelete(card.id)}
        disabled={disabled}
      >
        <DeleteGlyph />
      </button>
    </div>
  );
}

function EditGlyph() {
  return (
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
  );
}

function DeleteGlyph() {
  return (
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
  );
}
