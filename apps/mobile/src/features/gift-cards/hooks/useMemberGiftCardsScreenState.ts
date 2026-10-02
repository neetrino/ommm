import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  confirmGiftCardPayment,
  createGiftCheckout,
  fetchGiftMarket,
  fetchGiftSpendableBalance,
  fetchPurchasedGiftCards,
  fetchReceivedGiftCards,
  type GiftMarketCard,
  type GiftRecipientOption,
  type UserGiftCardRow,
} from "../../../lib/api/giftCardsClient";
import {
  isArcaCheckoutEnabled,
  startArcaCardCheckout,
} from "../../../lib/payments/arcaCheckout";
import { buildPaymentOutcomeHref } from "../../../lib/payments/paymentResultPaths";

export type GiftCardsTab = "my" | "shop";

type UseMemberGiftCardsScreenStateParams = {
  initialTab: GiftCardsTab;
};

export function useMemberGiftCardsScreenState({
  initialTab,
}: UseMemberGiftCardsScreenStateParams) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("userPages.giftCards");
  const tPurchase = useTranslations("userPages.giftCards.purchaseForm");
  const [tab, setTab] = useState<GiftCardsTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [market, setMarket] = useState<GiftMarketCard[]>([]);
  const [purchased, setPurchased] = useState<UserGiftCardRow[]>([]);
  const [received, setReceived] = useState<UserGiftCardRow[]>([]);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [buyBusy, setBuyBusy] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = await readStoredAccessToken();
    if (token === null) {
      setError(t("signInRequired"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [marketRows, purchasedRows, receivedRows, balance] =
        await Promise.all([
          fetchGiftMarket(token),
          fetchPurchasedGiftCards(token),
          fetchReceivedGiftCards(token),
          fetchGiftSpendableBalance(token),
        ]);
      setMarket(marketRows);
      setPurchased(purchasedRows);
      setReceived(receivedRows);
      setBalanceCents(balance);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loadError", { status: "" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedCard = useMemo(
    () =>
      selectedCardId === null
        ? null
        : (market.find((card) => card.id === selectedCardId) ?? null),
    [market, selectedCardId],
  );

  const myCards = useMemo(
    () => [
      ...purchased.map((card) => ({ card, source: "purchased" as const })),
      ...received.map((card) => ({ card, source: "received" as const })),
    ],
    [purchased, received],
  );

  const openCard = useCallback((cardId: string) => {
    setBuyError(null);
    setSelectedCardId(cardId);
  }, []);

  const closeCard = useCallback(() => {
    if (buyBusy) {
      return;
    }
    setSelectedCardId(null);
    setBuyError(null);
  }, [buyBusy]);

  const confirmBuy = useCallback(
    async (recipient: GiftRecipientOption): Promise<boolean> => {
      if (selectedCard === null) {
        return false;
      }
      const token = await readStoredAccessToken();
      if (token === null) {
        setBuyError(tPurchase("checkoutFailed"));
        return false;
      }
      setBuyBusy(true);
      setBuyError(null);
      try {
        const payment = await createGiftCheckout(token, {
          batchId: selectedCard.id,
          amountCents: selectedCard.amountCents,
          recipientId: recipient.id,
        });
        const reference = payment.paymentReference;
        if (reference === null || reference === "") {
          setBuyError(tPurchase("checkoutUnavailable"));
          return false;
        }
        setSelectedCardId(null);
        if (isArcaCheckoutEnabled()) {
          await startArcaCardCheckout(token, reference, locale);
        } else {
          await confirmGiftCardPayment(token, reference);
          router.push(
            buildPaymentOutcomeHref("success", {
              reference,
              source: "gift",
            }),
          );
        }
        return true;
      } catch (e) {
        setBuyError(
          e instanceof Error ? e.message : tPurchase("checkoutFailed"),
        );
        return false;
      } finally {
        setBuyBusy(false);
      }
    },
    [locale, router, selectedCard, tPurchase],
  );

  return {
    tab,
    setTab,
    loading,
    error,
    market,
    myCards,
    balanceCents,
    selectedCard,
    buyBusy,
    buyError,
    reload: load,
    openCard,
    closeCard,
    confirmBuy,
  };
}
