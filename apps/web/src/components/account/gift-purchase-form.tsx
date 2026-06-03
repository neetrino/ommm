"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { GiftCardThumbnail } from "@/components/gift-cards/gift-card-thumbnail";
import { ApiError, apiFetch } from "@/lib/api";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { formatAmdFromCents } from "@/lib/price-amd";

type GiftBatchMarketItem = {
  id: string;
  amountCents: number;
  imageUrl: string | null;
  availableQuantity: number;
  totalQuantity: number;
  expiresAt: string | null;
  status: string;
};

export function GiftPurchaseForm() {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const [items, setItems] = useState<GiftBatchMarketItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadMarket() {
      setLoading(true);
      setError(null);
      try {
        const rows = await apiFetch<GiftBatchMarketItem[]>("/gift-cards/market");
        if (cancelled) {
          return;
        }
        setItems(rows);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof ApiError ? err.message : t("loadFailed"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadMarket();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function onBuy(item: GiftBatchMarketItem) {
    setBusyBatchId(item.id);
    setStatus(null);
    try {
      const { url } = await apiFetch<{ url: string | null }>(
        "/payments/checkout/gift",
        {
          method: "POST",
          body: JSON.stringify({
            batchId: item.id,
            amountCents: item.amountCents,
          }),
        },
      );
      if (url) {
        window.location.href = url;
        return;
      }
      setStatus(t("checkoutUnavailable"));
    } catch (err) {
      setStatus(err instanceof ApiError ? err.message : t("checkoutFailed"));
    } finally {
      setBusyBatchId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-sage-500">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-sage-500">{t("empty")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <PurchaseGiftCardPreview
            key={item.id}
            item={item}
            busy={busyBatchId !== null}
            onBuy={onBuy}
          />
        ))}
      </div>
      {status ? <p className="text-sm text-sage-500">{status}</p> : null}
    </div>
  );
}

function PurchaseGiftCardPreview({
  item,
  busy,
  onBuy,
}: {
  item: GiftBatchMarketItem;
  busy: boolean;
  onBuy: (item: GiftBatchMarketItem) => Promise<void>;
}) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const giftCardsT = useTranslations("userPages.giftCards");
  const amountLabel = formatAmdFromCents(item.amountCents, "hy");

  return (
    <article className="rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] sm:p-7">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] border border-white/70 bg-sage-100 shadow-[0_14px_26px_-18px_rgba(45,40,35,0.45)]">
        <GiftCardThumbnail
          imageUrl={item.imageUrl}
          alt={t("selectedImageAlt")}
          fallbackLabel={t("noImage")}
        />
      </div>
      <div className="mt-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-semibold tracking-tight text-sage-950">{amountLabel}</p>
          <span className="inline-flex rounded-full border border-sage-900/70 bg-white px-3 py-1 text-sm leading-none text-sage-900">
            {giftCardsT(`statusValues.${item.status}`)}
          </span>
        </div>
        <dl className="grid gap-2.5 text-lg text-sage-700">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sage-600">{giftCardsT("cardExpiration")}</dt>
            <dd className="text-right text-sage-800">
              {item.expiresAt !== null
                ? displayGiftCardDate(item.expiresAt)
                : giftCardsT("cardNoExpiration")}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sage-600">{t("availableLabel")}</dt>
            <dd className="text-right text-sage-800">
              {item.availableQuantity} / {item.totalQuantity}
            </dd>
          </div>
        </dl>
        <OmmButton
          type="button"
          variant="primary"
          className="w-full"
          disabled={busy || item.availableQuantity <= 0}
          onClick={() => void onBuy(item)}
        >
          {t("buyGiftCard")}
        </OmmButton>
      </div>
    </article>
  );
}
