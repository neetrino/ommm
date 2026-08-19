"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinancePaymentCompactRow } from "@/components/admin/admin-finance-payment-compact-row";
import { AdminFinancePaymentDetailsSheet } from "@/components/admin/admin-finance-payment-details-sheet";
import type { AdminUpdatablePaymentStatus } from "@/components/admin/admin-finance-payment-status-picker";
import {
  ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_METHOD_HEADER_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_SCROLL_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-payments-list-layout";
import type {
  FinanceFilterValues,
  FinancePaymentItem,
  FinancePaymentsPayload,
} from "@/components/admin/admin-finance-types";
import type { FinanceStudioDateRange } from "@/components/admin/admin-finance-dates";
import {
  buildFinancePaymentsAdminApiQuery,
  FINANCE_PAYMENTS_PAGE_KEYS,
} from "@/components/admin/admin-finance-url";
import { AdminCenterToast, type AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { ApiError, apiFetch } from "@/lib/api";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

type Props = {
  locale: string;
  initialPayments: FinancePaymentsPayload;
  paymentsRange: FinanceStudioDateRange;
  financeFilters: FinanceFilterValues;
};

type ToastState = { message: string; tone: AdminCenterToastTone } | null;

export function AdminFinancePaymentsPanel({
  locale,
  initialPayments,
  paymentsRange,
  financeFilters,
}: Props) {
  const t = useTranslations("adminPages.finance.paymentsTab");
  const tFinance = useTranslations("adminPages.finance");
  const tTable = useTranslations("adminPages.finance.table");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [paymentsPayload, setPaymentsPayload] = usePropSyncedState(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<FinancePaymentItem | null>(null);
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const hasMounted = useRef(false);

  const payListPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), FINANCE_PAYMENTS_PAGE_KEYS),
    [searchParams],
  );

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPayListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize, FINANCE_PAYMENTS_PAGE_KEYS);
      });
    },
    [replaceSearchParams],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const nextRequestId = requestId.current + 1;
    requestId.current = nextRequestId;
    startTransition(() => {
      void apiFetch<FinancePaymentsPayload>(
        buildFinancePaymentsAdminApiQuery(financeFilters, paymentsRange, payListPage),
      )
        .then((payload) => {
          if (requestId.current !== nextRequestId) return;
          setPaymentsPayload(payload);
          setError(null);
        })
        .catch(() => {
          if (requestId.current === nextRequestId) {
            setError(t("loadFailed"));
          }
        });
    });
  }, [financeFilters, payListPage, paymentsRange, setPaymentsPayload, t]);

  function handlePaymentUpdated(updated: FinancePaymentItem): void {
    setPaymentsPayload((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updated.id ? updated : item)),
    }));
    setSelectedPayment((current) => (current?.id === updated.id ? updated : current));
  }

  async function handlePaymentStatusChange(
    payment: FinancePaymentItem,
    nextStatus: AdminUpdatablePaymentStatus,
  ): Promise<void> {
    if (nextStatus === payment.status) {
      return;
    }

    setBusyPaymentId(payment.id);
    try {
      await apiFetch(`/payments/admin/${payment.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      handlePaymentUpdated({
        ...payment,
        status: nextStatus,
        paymentMethod:
          payment.paymentMethod ??
          (nextStatus === "SUCCEEDED" || nextStatus === "FAILED" ? "CASH" : null),
        confirmedAt:
          nextStatus === "PENDING"
            ? null
            : (payment.confirmedAt ?? new Date().toISOString()),
      });
      setToast({
        message: tFinance("paymentActions.statusUpdated"),
        tone: "ok",
      });
    } catch (updateError) {
      setToast({
        message:
          updateError instanceof ApiError
            ? updateError.message
            : tFinance("paymentActions.actionFailed"),
        tone: "err",
      });
    } finally {
      setBusyPaymentId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? <div className="app-alert-warn">{error}</div> : null}
      {loading ? <p className="text-sm text-sage-500">{t("loading")}</p> : null}

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_SCROLL_CLASS}>
        <div className={ADMIN_FINANCE_PAYMENTS_LIST_TABLE_CLASS}>
          <div className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CLASS}>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL}>{tTable("colUser")}</span>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL}>{tTable("colPlan")}</span>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL}>{tTable("colAmount")}</span>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL}>{tTable("colDate")}</span>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL}>{tTable("colTime")}</span>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL}>{tTable("colSource")}</span>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL}>{tTable("colStatus")}</span>
            <span className={ADMIN_FINANCE_PAYMENTS_LIST_METHOD_HEADER_CELL}>
              {tTable("colPaymentMethod")}
            </span>
          </div>
          {paymentsPayload.items.length === 0 ? (
            <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
              {tTable("empty")}
            </p>
          ) : (
            paymentsPayload.items.map((row) => (
              <AdminFinancePaymentCompactRow
                key={row.id}
                locale={locale}
                row={row}
                busy={busyPaymentId === row.id}
                onOpenDetails={() => setSelectedPayment(row)}
                onChangeStatus={(nextStatus) => {
                  void handlePaymentStatusChange(row, nextStatus);
                }}
              />
            ))
          )}
        </div>
      </div>

      <AdminFinancePaymentDetailsSheet
        payment={selectedPayment}
        locale={locale}
        onClose={() => setSelectedPayment(null)}
        onPaymentUpdated={handlePaymentUpdated}
      />

      <OmmListPagination
        total={paymentsPayload.total}
        page={payListPage.page}
        pageSize={payListPage.pageSize}
        offset={paymentsPayload.offset}
        onPageChange={(page) => setPayListPage(page)}
        disabled={loading}
      />

      <AdminCenterToast
        message={toast?.message ?? null}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
