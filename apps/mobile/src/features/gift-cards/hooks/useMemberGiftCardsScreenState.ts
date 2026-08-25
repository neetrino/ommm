import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  confirmGiftCardPayment,
  createGiftCheckout,
  fetchGiftMarket,
  fetchGiftSpendableBalance,
  fetchPurchasedGiftCards,
  fetchReceivedGiftCards,
  redeemGiftCardCode,
  type GiftMarketCard,
  type GiftRecipientOption,
  type UserGiftCardRow,
} from "../../../lib/api/giftCardsClient";
import {
  isArcaCheckoutEnabled,
  startArcaCardCheckout,
} from "../../../lib/payments/arcaCheckout";

export type GiftCardsTab = "my" | "shop";

type UseMemberGiftCardsScreenStateParams = {
  initialTab: GiftCardsTab;
};

export function useMemberGiftCardsScreenState({
  initialTab,
}: UseMemberGiftCardsScreenStateParams) {
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
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

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
          await load();
          setTab("my");
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
    [load, locale, selectedCard, tPurchase],
  );

  const onRedeem = useCallback(async () => {
    const code = redeemCode.trim();
    if (code === "") {
      setRedeemMessage({ kind: "err", text: t("redeemForm.failed") });
      return;
    }
    const token = await readStoredAccessToken();
    if (token === null) {
      setRedeemMessage({ kind: "err", text: t("signInRequired") });
      return;
    }
    setRedeemBusy(true);
    setRedeemMessage(null);
    try {
      await redeemGiftCardCode(token, code);
      setRedeemCode("");
      setRedeemMessage({ kind: "ok", text: t("redeemForm.success") });
      await load();
    } catch (e) {
      setRedeemMessage({
        kind: "err",
        text: e instanceof Error ? e.message : t("redeemForm.failed"),
      });
    } finally {
      setRedeemBusy(false);
    }
  }, [load, redeemCode, t]);

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
    redeemCode,
    setRedeemCode,
    redeemBusy,
    redeemMessage,
    reload: load,
    openCard,
    closeCard,
    confirmBuy,
    onRedeem,
  };
}
