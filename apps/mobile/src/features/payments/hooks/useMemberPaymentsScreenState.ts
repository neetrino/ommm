import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  fetchMyPayments,
  type UserPaymentRow,
} from "../../../lib/api/paymentsClient";
import { useTranslations } from "../../../i18n/I18nProvider";

const PAYMENTS_PAGE_TAKE = 50;

export function useMemberPaymentsScreenState() {
  const t = useTranslations("userPages.payments");
  const [items, setItems] = useState<UserPaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const token = await readStoredAccessToken();
        if (token === null) {
          setItems([]);
          setTotal(0);
          setError(t("signInRequired"));
          return;
        }
        const payload = await fetchMyPayments(token, {
          take: PAYMENTS_PAGE_TAKE,
          offset: 0,
          order: "newest",
        });
        setItems(payload.items);
        setTotal(payload.total);
      } catch (e) {
        setItems([]);
        setTotal(0);
        setError(
          e instanceof Error
            ? e.message
            : t("loadError", { status: "error" }),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t],
  );

  useFocusEffect(
    useCallback(() => {
      void load("initial");
    }, [load]),
  );

  return {
    items,
    total,
    loading,
    refreshing,
    error,
    refresh: () => {
      void load("refresh");
    },
    reload: () => {
      void load("initial");
    },
  };
}
