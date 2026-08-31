import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  fetchMyPayments,
  type UserPaymentRow,
} from "../../../lib/api/paymentsClient";
import { useTranslations } from "../../../i18n/I18nProvider";
import type { PaymentStatusFilter } from "../components/PaymentStatusFilterDropdown";

const PAYMENTS_PAGE_TAKE = 50;

function applyStatusFilters(
  items: UserPaymentRow[],
  statuses: readonly PaymentStatusFilter[],
): UserPaymentRow[] {
  if (statuses.length === 0) {
    return items;
  }
  const allowed = new Set<string>(statuses);
  return items.filter((item) => allowed.has(item.status));
}

export function useMemberPaymentsScreenState() {
  const t = useTranslations("userPages.payments");
  const [items, setItems] = useState<UserPaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter[]>([]);
  const statusFilterRef = useRef(statusFilter);
  statusFilterRef.current = statusFilter;

  const load = useCallback(
    async (
      mode: "initial" | "refresh" = "initial",
      statuses: readonly PaymentStatusFilter[] = statusFilterRef.current,
    ) => {
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
          ...(statuses.length === 1 ? { status: statuses[0] } : {}),
        });
        const filtered = applyStatusFilters(payload.items, statuses);
        setItems(filtered);
        setTotal(
          statuses.length <= 1 ? payload.total : filtered.length,
        );
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

  const setStatusFilterAndReload = useCallback(
    (next: PaymentStatusFilter[]) => {
      statusFilterRef.current = next;
      setStatusFilter(next);
      void load("initial", next);
    },
    [load],
  );

  return {
    items,
    total,
    loading,
    refreshing,
    error,
    statusFilter,
    setStatusFilter: setStatusFilterAndReload,
    refresh: () => {
      void load("refresh");
    },
    reload: () => {
      void load("initial");
    },
  };
}
