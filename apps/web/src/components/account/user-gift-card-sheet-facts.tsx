"use client";

import { useTranslations } from "next-intl";
import type { UserGiftCardWithSource } from "@/lib/merge-user-gift-cards";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";

const DETAIL_LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-500";

const DETAIL_VALUE_CLASS = "text-sm font-medium text-sage-900 text-right";

const DETAIL_BLOCK_CLASS =
  "divide-y divide-sand-100/90 rounded-[1.35rem] border border-white/70 bg-white/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]";

const DETAIL_ROW_CLASS =
  "flex items-baseline justify-between gap-x-6 gap-y-1 px-3.5 py-3";

const ACTION_CLASS =
  "rounded-full border border-sand-500/30 bg-white px-3 py-1.5 text-xs font-semibold text-sage-800";

type UserGiftCardSheetFactsProps = {
  card: UserGiftCardWithSource;
};

/** Code, dates, recipient, and note, in the same rows as package details. */
export function UserGiftCardSheetFacts({ card }: UserGiftCardSheetFactsProps) {
  const t = useTranslations("userPages.giftCards");
  const recipient = card.recipientName?.trim() || card.recipientEmail?.trim() || "";
  const message = card.message?.trim() ?? "";
  const expires =
    card.expiresAt !== null ? displayGiftCardDate(card.expiresAt) : t("cardNoExpiration");

  return (
    <div className="space-y-3">
      <dl className={DETAIL_BLOCK_CLASS}>
        <DetailRow
          label={t("cardCode")}
          value={card.code}
          valueClassName="font-mono text-sm font-semibold tracking-wide text-sage-950 text-right"
        />
        <DetailRow label={t("cardCreated")} value={displayGiftCardDate(card.createdAt)} />
        <DetailRow label={t("cardExpiration")} value={expires} />
        {recipient.length > 0 ? (
          <DetailRow label={t("cardRecipient")} value={recipient} />
        ) : null}
      </dl>
      {message.length > 0 ? <GiftNote label={t("cardMessage")} message={message} /> : null}
      <GiftCardActions cardId={card.id} code={card.code} />
    </div>
  );
}

function GiftCardActions({ cardId, code }: { cardId: string; code: string }) {
  const t = useTranslations("userPages.giftCards");
  return (
    <div className="flex flex-wrap gap-2 px-1">
      <button type="button" className={ACTION_CLASS} onClick={() => copyGiftCode(code)}>
        {t("copyCode")}
      </button>
      <a className={ACTION_CLASS} href={whatsAppShareHref(code)} target="_blank" rel="noreferrer">
        {t("shareWhatsApp")}
      </a>
      <button type="button" className={ACTION_CLASS} onClick={() => window.print()}>
        {t("printCard")}
      </button>
      <a href={`/api/v1/gift-cards/me/${cardId}/pdf`} className={ACTION_CLASS}>
        {t("downloadPdf")}
      </a>
    </div>
  );
}

function GiftNote({ label, message }: { label: string; message: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-gradient-to-br from-white/90 via-white/75 to-sand-50/80 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <p className={DETAIL_LABEL_CLASS}>{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-sage-900">{message}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClassName = DETAIL_VALUE_CLASS,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className={DETAIL_ROW_CLASS}>
      <dt className={DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={`min-w-0 break-words ${valueClassName}`}>{value}</dd>
    </div>
  );
}

function copyGiftCode(code: string): void {
  void navigator.clipboard.writeText(code);
}

function whatsAppShareHref(code: string): string {
  const text = encodeURIComponent(`Ommm gift card: ${code}`);
  return `https://wa.me/?text=${text}`;
}
