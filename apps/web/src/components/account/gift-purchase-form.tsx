"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  GiftMarketCardDetailsSheet,
  type GiftMarketCardPreview,
} from "@/components/account/gift-market-card-details-sheet";
import { GIFT_CARD_BOARD_GRID_CLASS } from "@/components/account/user-gift-card-tile-layout";
import { GiftCardBoardTile } from "@/components/gift-cards/gift-card-board-tile";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { GIFT_CARD_CHECKOUT_PATH } from "@/lib/payment-checkout-source";
import { formatAmdFromCents } from "@/lib/price-amd";

type PendingPaymentResponse = {
  paymentReference: string | null;
};

type GiftPurchaseFormProps = {
  locale: string;
};

export function GiftPurchaseForm({ locale }: GiftPurchaseFormProps) {
  const router = useRouter();
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const [items, setItems] = useState<GiftMarketCardPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCard =
    selectedId === null ? null : (items.find((item) => item.id === selectedId) ?? null);

  useEffect(() => {
    let cancelled = false;
    async function loadMarket() {
      setLoading(true);
      setError(null);
      try {
        const rows = await apiFetch<GiftMarketCardPreview[]>("/gift-cards/market");
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

  async function onBuy(item: GiftMarketCardPreview) {
    setBusyBatchId(item.id);
    setStatus(null);
    try {
      const payment = await apiFetch<PendingPaymentResponse>(
        "/payments/checkout/gift",
        {
          method: "POST",
          body: JSON.stringify({
            batchId: item.id,
            amountCents: item.amountCents,
          }),
        },
      );
      const params = new URLSearchParams({
        amountCents: item.amountCents.toString(),
      });
      if (payment.paymentReference !== null) {
        params.set("reference", payment.paymentReference);
      }
      setSelectedId(null);
      router.push(`${GIFT_CARD_CHECKOUT_PATH}?${params.toString()}`);
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
      <div className={GIFT_CARD_BOARD_GRID_CLASS}>
        {items.map((item) => (
          <PurchaseGiftCardPreview
            key={item.id}
            item={item}
            locale={locale}
            busy={busyBatchId !== null}
            onOpen={() => setSelectedId(item.id)}
            onBuy={onBuy}
          />
        ))}
      </div>
      {status ? <p className="text-sm text-sage-500">{status}</p> : null}
      <GiftMarketCardDetailsSheet
        card={selectedCard}
        locale={locale}
        busy={busyBatchId !== null}
        onClose={() => setSelectedId(null)}
        onBuy={(card) => {
          void onBuy(card);
        }}
      />
    </div>
  );
}

function PurchaseGiftCardPreview({
  item,
  locale,
  busy,
  onOpen,
  onBuy,
}: {
  item: GiftMarketCardPreview;
  locale: string;
  busy: boolean;
  onOpen: () => void;
  onBuy: (item: GiftMarketCardPreview) => Promise<void>;
}) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const giftCardsT = useTranslations("userPages.giftCards");
  const amountLabel = formatAmdFromCents(item.amountCents, locale);

  return (
    <GiftCardBoardTile
      amountLabel={amountLabel}
      status={item.status}
      statusLabel={giftCardsT(`statusValues.${item.status}`)}
      imageUrl={item.imageUrl}
      imageAlt={t("selectedImageAlt")}
      imageFallbackLabel={t("noImage")}
      openAriaLabel={t("openDetailsAria", { amount: amountLabel })}
      onOpen={onOpen}
      details={[
        {
          label: giftCardsT("cardExpiration"),
          value:
            item.expiresAt !== null
              ? displayGiftCardDate(item.expiresAt)
              : giftCardsT("cardNoExpiration"),
        },
        {
          label: t("availableLabel"),
          value: `${item.availableQuantity} / ${item.totalQuantity}`,
        },
      ]}
      footerAriaLabel={t("buyGiftCard")}
      footerActions={
        <OmmButton
          type="button"
          variant="primary"
          size="sm"
          disabled={busy || item.availableQuantity <= 0}
          onClick={() => void onBuy(item)}
        >
          {t("buyGiftCard")}
        </OmmButton>
      }
    />
  );
}
