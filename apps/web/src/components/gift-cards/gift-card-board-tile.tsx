"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { GiftCardThumbnail } from "@/components/gift-cards/gift-card-thumbnail";
import { giftCardStatusBadgeClass } from "@/components/gift-cards/gift-card-display-helpers";

/** Board grid — admin gift cards directory and user gift cards page. */
export const GIFT_CARD_BOARD_GRID_CLASS = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3";

const GIFT_CARD_BOARD_TILE_CLASS = [
  "flex flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/90",
  "shadow-[0_20px_44px_-22px_rgba(45,40,35,0.28)]",
].join(" ");

const GIFT_CARD_BOARD_TILE_INTERACTIVE_CLASS = [
  GIFT_CARD_BOARD_TILE_CLASS,
  "cursor-pointer transition-all",
  "hover:-translate-y-0.5 hover:border-sand-500/30 hover:shadow-[0_26px_52px_-22px_rgba(45,40,35,0.34)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

/** Footer toolbar for board tile actions (admin activate/edit, user buy/copy). */
export const GIFT_CARD_BOARD_FOOTER_CLASS =
  "mt-auto flex flex-wrap items-center justify-center gap-1 pt-3";

export const GIFT_CARD_BOARD_TEXT_ACTION_CLASS =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-sage-700 transition-colors hover:bg-sand-100/90 active:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40";

export type GiftCardBoardDetail = {
  label: string;
  value: string;
  valueClassName?: string;
};

type GiftCardBoardTileProps = {
  amountLabel: string;
  status: string;
  statusLabel: string;
  imageUrl: string | null;
  imageAlt: string;
  imageFallbackLabel: string;
  details: readonly GiftCardBoardDetail[];
  openAriaLabel?: string;
  onOpen?: () => void;
  footerActions?: ReactNode;
  footerAriaLabel?: string;
  imageOverlayActions?: ReactNode;
  imageBadge?: {
    label: string;
    className?: string;
  };
};

export function GiftCardBoardTile({
  amountLabel,
  status,
  statusLabel,
  imageUrl,
  imageAlt,
  imageFallbackLabel,
  details = [],
  openAriaLabel,
  onOpen,
  footerActions,
  footerAriaLabel,
  imageOverlayActions,
  imageBadge,
}: GiftCardBoardTileProps) {
  const isInteractive = onOpen !== undefined;
  const hasImageOverlay = imageOverlayActions !== undefined;

  const tileClassName = [
    isInteractive ? GIFT_CARD_BOARD_TILE_INTERACTIVE_CLASS : GIFT_CARD_BOARD_TILE_CLASS,
    hasImageOverlay ? "group" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isInteractive || onOpen === undefined) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  function handleClick() {
    onOpen?.();
  }

  return (
    <article
      {...(isInteractive
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-label": openAriaLabel,
            onClick: handleClick,
            onKeyDown: handleKeyDown,
          }
        : {})}
      className={tileClassName}
    >
      <div className="p-4 pb-3">
        <div className="overflow-hidden rounded-[20px] border border-white/90 bg-white shadow-[0_16px_36px_-18px_rgba(45,40,35,0.32)]">
          <div className="relative aspect-[1.62/1] w-full bg-gradient-to-br from-sand-50 via-paper to-mint-50">
            <GiftCardThumbnail
              imageUrl={imageUrl}
              alt={imageAlt}
              fallbackLabel={imageFallbackLabel}
              className="h-full w-full object-cover"
            />
            {imageBadge ? (
              <span
                className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] shadow-sm ${imageBadge.className ?? "bg-white/92 text-sage-800"}`}
              >
                {imageBadge.label}
              </span>
            ) : null}
            {hasImageOverlay ? (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-end bg-gradient-to-b from-sage-900/40 via-sage-900/5 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <div
                  className="pointer-events-auto"
                  onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
                  onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => event.stopPropagation()}
                >
                  {imageOverlayActions}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif text-2xl font-normal text-sage-900">{amountLabel}</p>
          <span
            className={`${giftCardStatusBadgeClass(status)} shrink-0 font-semibold uppercase tracking-wide`}
          >
            {statusLabel}
          </span>
        </div>

        <dl className="grid gap-2.5 text-sm">
          {details.map((detail) => (
            <GiftCardBoardDetailRow
              key={detail.label}
              label={detail.label}
              value={detail.value}
              valueClassName={detail.valueClassName}
            />
          ))}
        </dl>

        {footerActions ? (
          <GiftCardBoardFooter ariaLabel={footerAriaLabel}>{footerActions}</GiftCardBoardFooter>
        ) : null}
      </div>
    </article>
  );
}

type GiftCardBoardFooterProps = {
  children: ReactNode;
  ariaLabel?: string;
};

export function GiftCardBoardFooter({ children, ariaLabel }: GiftCardBoardFooterProps) {
  return (
    <div
      className={GIFT_CARD_BOARD_FOOTER_CLASS}
      onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => event.stopPropagation()}
      role="toolbar"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

function GiftCardBoardDetailRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-sand-500/10 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">{label}</dt>
      <dd className={`truncate text-right font-medium text-sage-800 ${valueClassName}`.trim()}>
        {value}
      </dd>
    </div>
  );
}
