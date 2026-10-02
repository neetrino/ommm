"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminGiftOtherClassesButton } from "@/components/admin/admin-gift-other-classes-button";
import { GiftCardFace } from "@/components/gift-cards/gift-card-face";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";

type IssuedGiftCard = {
  id: string;
  batchId: string | null;
  code: string;
  status: string;
  balanceAmd: number;
  balanceClasses: number;
  classTypeId: string | null;
  allowOtherClasses?: boolean;
  expiresAt: string | null;
};

type AdminGiftIssuedCardsProps = {
  batchId: string;
  locale: string;
  onChanged: () => void;
};

export function AdminGiftIssuedCards({ batchId, locale, onChanged }: AdminGiftIssuedCardsProps) {
  const t = useTranslations("adminPages.giftCards.actions");
  const [cards, setCards] = useState<IssuedGiftCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<IssuedGiftCard[]>("/gift-cards/admin")
      .then((rows) => {
        if (!cancelled) {
          setCards(rows.filter((row) => row.batchId === batchId));
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof ApiError ? caught.message : t("failed"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [batchId, t, notice]);

  return (
    <section className="mt-4 space-y-3 rounded-[24px] border border-white/70 bg-white/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-sage-900">{t("issuedCards")}</h3>
        <OmmButton type="button" variant="secondary" size="sm" onClick={() => void downloadBatchWorkbook(batchId)}>
          {t("exportExcel")}
        </OmmButton>
      </div>
      {error !== null ? <p className="text-sm text-red-800">{error}</p> : null}
      {notice !== null ? <p className="text-sm text-sage-700">{notice}</p> : null}
      <ul className="space-y-3">
        {cards.map((card) => (
          <IssuedCardRow
            key={card.id}
            card={card}
            locale={locale}
            extendLabel={t("extendExpiry")}
            adjustLabel={t("adjustBalance")}
            deactivateLabel={t("deactivate")}
            onDone={(message) => {
              setNotice(message);
              onChanged();
            }}
            onError={setError}
            savedLabel={t("cardSaved")}
            failedLabel={t("failed")}
            convertMoneyLabel={t("convertToMoney")}
            convertClassLabel={t("convertToClasses")}
          />
        ))}
      </ul>
    </section>
  );
}

function IssuedCardRow({
  card,
  locale,
  extendLabel,
  adjustLabel,
  deactivateLabel,
  savedLabel,
  failedLabel,
  convertMoneyLabel,
  convertClassLabel,
  onDone,
  onError,
}: {
  card: IssuedGiftCard;
  locale: string;
  extendLabel: string;
  adjustLabel: string;
  deactivateLabel: string;
  savedLabel: string;
  failedLabel: string;
  convertMoneyLabel: string;
  convertClassLabel: string;
  onDone: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [expiresAt, setExpiresAt] = useState(toDateInput(card.expiresAt));
  const [balanceAmd, setBalanceAmd] = useState(String(card.balanceAmd));
  const [balanceClasses, setBalanceClasses] = useState(String(card.balanceClasses));

  return (
    <li className="rounded-2xl border border-sand-500/20 p-3 text-sm text-sage-800">
      <GiftCardFace code={card.code} alt={card.code} className="mb-2 aspect-[1.58/1] overflow-hidden rounded-xl" />
      <p className="mt-1">
        {card.status} · {formatAmdFromCents(card.balanceAmd, locale)}
        {card.balanceClasses > 0 ? ` · ${card.balanceClasses}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={expiresAt}
          className="h-9 rounded-xl border border-sand-500/30 bg-white px-2"
          onChange={(event) => setExpiresAt(event.target.value)}
        />
        <OmmButton type="button" variant="ghost" size="sm" onClick={() => void saveExpiry(card.id, expiresAt, savedLabel, failedLabel, onDone, onError)}>
          {extendLabel}
        </OmmButton>
        <input
          inputMode="numeric"
          value={balanceAmd}
          className="h-9 w-28 rounded-xl border border-sand-500/30 bg-white px-2"
          onChange={(event) => setBalanceAmd(event.target.value)}
        />
        <OmmButton type="button" variant="ghost" size="sm" onClick={() => void saveBalance(card.id, balanceAmd, balanceClasses, savedLabel, failedLabel, onDone, onError)}>
          {adjustLabel}
        </OmmButton>
        <input
          inputMode="numeric"
          value={balanceClasses}
          className="h-9 w-20 rounded-xl border border-sand-500/30 bg-white px-2"
          onChange={(event) => setBalanceClasses(event.target.value)}
        />
        <OmmButton type="button" variant="ghost" size="sm" onClick={() => void convertCard(card, savedLabel, failedLabel, onDone, onError)}>
          {card.balanceClasses > 0 ? convertMoneyLabel : convertClassLabel}
        </OmmButton>
        {card.classTypeId !== null ? (
          <AdminGiftOtherClassesButton
            cardId={card.id}
            allowed={card.allowOtherClasses === true}
            onDone={onDone}
            onError={onError}
          />
        ) : null}
        {card.status === "ACTIVE" ? (
          <OmmButton type="button" variant="ghost" size="sm" onClick={() => void deactivateCard(card.id, savedLabel, failedLabel, onDone, onError)}>
            {deactivateLabel}
          </OmmButton>
        ) : null}
      </div>
    </li>
  );
}

function toDateInput(value: string | null): string {
  if (value === null) {
    return "";
  }
  return value.slice(0, 10);
}

async function downloadBatchWorkbook(batchId: string): Promise<void> {
  const response = await fetch(`/api/v1/gift-cards/admin/batches/${batchId}/export`, {
    credentials: "include",
  });
  if (!response.ok) {
    return;
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gift-cards-${batchId}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

async function saveExpiry(
  id: string,
  expiresAt: string,
  savedLabel: string,
  failedLabel: string,
  onDone: (message: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  if (expiresAt.trim().length === 0) {
    return;
  }
  await runCardWrite(
    () =>
      apiFetch(`/gift-cards/admin/cards/${id}/expires`, {
        method: "PATCH",
        body: JSON.stringify({ expiresAt: new Date(`${expiresAt}T12:00:00.000Z`).toISOString() }),
      }),
    savedLabel,
    failedLabel,
    onDone,
    onError,
  );
}

async function saveBalance(
  id: string,
  balanceAmd: string,
  balanceClasses: string,
  savedLabel: string,
  failedLabel: string,
  onDone: (message: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  const parsedAmd = Number.parseInt(balanceAmd, 10);
  const parsedClasses = Number.parseInt(balanceClasses, 10);
  if (!Number.isFinite(parsedAmd) || parsedAmd < 0 || !Number.isFinite(parsedClasses) || parsedClasses < 0) {
    return;
  }
  await runCardWrite(
    () =>
      apiFetch(`/gift-cards/admin/cards/${id}/balance`, {
        method: "PATCH",
        body: JSON.stringify({ balanceAmd: parsedAmd, balanceClasses: parsedClasses }),
      }),
    savedLabel,
    failedLabel,
    onDone,
    onError,
  );
}

async function convertCard(
  card: IssuedGiftCard,
  savedLabel: string,
  failedLabel: string,
  onDone: (message: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  const direction = card.balanceClasses > 0 ? "TO_MONEY" : "TO_CLASSES";
  await runCardWrite(
    () =>
      apiFetch(`/gift-cards/admin/cards/${card.id}/convert`, {
        method: "POST",
        body: JSON.stringify({
          direction,
          ...(card.classTypeId ? { classTypeId: card.classTypeId } : {}),
        }),
      }),
    savedLabel,
    failedLabel,
    onDone,
    onError,
  );
}

async function deactivateCard(
  id: string,
  savedLabel: string,
  failedLabel: string,
  onDone: (message: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  await runCardWrite(
    () => apiFetch(`/gift-cards/admin/${id}/deactivate`, { method: "PATCH" }),
    savedLabel,
    failedLabel,
    onDone,
    onError,
  );
}

async function runCardWrite(
  request: () => Promise<unknown>,
  savedLabel: string,
  failedLabel: string,
  onDone: (message: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  try {
    await request();
    onDone(savedLabel);
  } catch (caught) {
    onError(caught instanceof ApiError ? caught.message : failedLabel);
  }
}
