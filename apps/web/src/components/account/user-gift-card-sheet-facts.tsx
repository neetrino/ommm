"use client";

import { useTranslations } from "next-intl";
import type { UserGiftCardWithSource } from "@/lib/merge-user-gift-cards";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import {
  DETAILS_CARD_ACTIONS_GRID_CLASS,
  DetailsField,
  DetailsFieldRow,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  ClockGlyph,
  NoteGlyph,
  TicketGlyph,
  UserGlyph,
} from "@/components/shared/details/details-glyphs";

const ACTION_CLASS = "ommm-btn-compact-secondary w-full";

type UserGiftCardSheetFactsProps = {
  card: UserGiftCardWithSource;
};

/** Code, dates, recipient, note, and share actions — rendered inside a details card. */
export function UserGiftCardSheetFacts({ card }: UserGiftCardSheetFactsProps) {
  const t = useTranslations("userPages.giftCards");
  const recipient = card.recipientName?.trim() || card.recipientEmail?.trim() || "";
  const message = card.message?.trim() ?? "";
  const expires =
    card.expiresAt !== null ? displayGiftCardDate(card.expiresAt) : t("cardNoExpiration");

  return (
    <>
      <DetailsFieldRow>
        <DetailsField label={t("cardCode")} icon={<TicketGlyph />} title={card.code}>
          <span className="font-mono font-semibold tracking-wide">{card.code}</span>
        </DetailsField>
        <DetailsField label={t("cardCreated")} icon={<CalendarGlyph />}>
          {displayGiftCardDate(card.createdAt)}
        </DetailsField>
        <DetailsField label={t("cardExpiration")} icon={<ClockGlyph />} wide={recipient.length === 0}>
          {expires}
        </DetailsField>
        {recipient.length > 0 ? (
          <DetailsField label={t("cardRecipient")} icon={<UserGlyph />} title={recipient}>
            {recipient}
          </DetailsField>
        ) : null}
        {message.length > 0 ? (
          <DetailsField label={t("cardMessage")} icon={<NoteGlyph />} wide multiline>
            {message}
          </DetailsField>
        ) : null}
      </DetailsFieldRow>
      <GiftCardActions cardId={card.id} code={card.code} />
    </>
  );
}

function GiftCardActions({ cardId, code }: { cardId: string; code: string }) {
  const t = useTranslations("userPages.giftCards");
  return (
    <div className={DETAILS_CARD_ACTIONS_GRID_CLASS}>
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

function copyGiftCode(code: string): void {
  void navigator.clipboard.writeText(code);
}

function whatsAppShareHref(code: string): string {
  const text = encodeURIComponent(`Ommm gift card: ${code}`);
  return `https://wa.me/?text=${text}`;
}
