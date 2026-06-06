"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  USER_GIFT_CARD_GRID_CLASS,
  USER_GIFT_CARD_STATUS_BADGE_CLASS,
  USER_GIFT_CARD_TILE_AMOUNT_CLASS,
  USER_GIFT_CARD_TILE_BODY_CLASS,
  USER_GIFT_CARD_TILE_HEADER_CLASS,
  USER_GIFT_CARD_TILE_IMAGE_FRAME_CLASS,
  USER_GIFT_CARD_TILE_META_DL_CLASS,
  USER_GIFT_CARD_TILE_META_LABEL_CLASS,
  USER_GIFT_CARD_TILE_META_ROW_CLASS,
  USER_GIFT_CARD_TILE_META_VALUE_CLASS,
  USER_GIFT_CARD_TILE_SHELL_CLASS,
} from "@/components/account/user-gift-card-tile-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { GiftCardThumbnail } from "@/components/gift-cards/gift-card-thumbnail";
import { ApiError, apiFetch } from "@/lib/api";
import {
  displayGiftCardDate,
  giftCardStatusBadgeClass,
} from "@/components/gift-cards/gift-card-display-helpers";
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

type PendingPaymentResponse = {
  paymentReference: string | null;
};

type GiftPurchaseFormProps = {
  locale: string;
};

export function GiftPurchaseForm({ locale }: GiftPurchaseFormProps) {
  const router = useRouter();
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
        batchId: item.id,
        amountCents: item.amountCents.toString(),
      });
      if (payment.paymentReference !== null) {
        params.set("reference", payment.paymentReference);
      }
      router.push(`/user/gift-cards/fake-payment?${params.toString()}`);
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
      <div className={USER_GIFT_CARD_GRID_CLASS}>
        {items.map((item) => (
          <PurchaseGiftCardPreview
            key={item.id}
            item={item}
            locale={locale}
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
  locale,
  busy,
  onBuy,
}: {
  item: GiftBatchMarketItem;
  locale: string;
  busy: boolean;
  onBuy: (item: GiftBatchMarketItem) => Promise<void>;
}) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const giftCardsT = useTranslations("userPages.giftCards");
  const amountLabel = formatAmdFromCents(item.amountCents, locale);

  return (
    <article className={USER_GIFT_CARD_TILE_SHELL_CLASS}>
      <div className={USER_GIFT_CARD_TILE_IMAGE_FRAME_CLASS}>
        <GiftCardThumbnail
          imageUrl={item.imageUrl}
          alt={t("selectedImageAlt")}
          fallbackLabel={t("noImage")}
        />
      </div>
      <div className={USER_GIFT_CARD_TILE_BODY_CLASS}>
        <div className={USER_GIFT_CARD_TILE_HEADER_CLASS}>
          <p className={USER_GIFT_CARD_TILE_AMOUNT_CLASS}>{amountLabel}</p>
          <span
            className={`${giftCardStatusBadgeClass(item.status)} ${USER_GIFT_CARD_STATUS_BADGE_CLASS}`}
          >
            {giftCardsT(`statusValues.${item.status}`)}
          </span>
        </div>
        <dl className={USER_GIFT_CARD_TILE_META_DL_CLASS}>
          <div className={USER_GIFT_CARD_TILE_META_ROW_CLASS}>
            <dt className={USER_GIFT_CARD_TILE_META_LABEL_CLASS}>{giftCardsT("cardExpiration")}</dt>
            <dd className={USER_GIFT_CARD_TILE_META_VALUE_CLASS}>
              {item.expiresAt !== null
                ? displayGiftCardDate(item.expiresAt)
                : giftCardsT("cardNoExpiration")}
            </dd>
          </div>
          <div className={USER_GIFT_CARD_TILE_META_ROW_CLASS}>
            <dt className={USER_GIFT_CARD_TILE_META_LABEL_CLASS}>{t("availableLabel")}</dt>
            <dd className={USER_GIFT_CARD_TILE_META_VALUE_CLASS}>
              {item.availableQuantity} / {item.totalQuantity}
            </dd>
          </div>
        </dl>
        <OmmButton
          type="button"
          variant="primary"
          size="sm"
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
