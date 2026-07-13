"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import type {
  ClientDetail,
  ClientSheetPackageItem,
  ClientSheetPaginatedResponse,
} from "@/components/admin/admin-clients-types";
import { AdminClientPackagePurchaseSheet } from "@/components/admin/admin-client-package-purchase-sheet";
import {
  replaceAdminClientsSearchParams,
} from "@/components/admin/admin-clients-query";
import {
  CLIENT_ADD_PACKAGE_QUERY_KEY,
  CLIENT_ADD_PACKAGE_QUERY_VALUE,
  CLIENT_PROFILE_TAB_QUERY_KEY,
  CLIENT_SHEET_TAB_PACKAGES,
} from "@/components/admin/admin-client-sheet-tabs";
import {
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/list-pagination";
import { isManualPaymentMethod } from "@/lib/manual-payment-method";

type ClientPackagesPanelProps = {
  client: ClientDetail;
  locale: string;
  active: boolean;
  refreshKey: number;
  allowPurchase: boolean;
  onPurchaseSuccess: () => void;
};

type PackagesFetchResult = {
  key: string;
  items: ClientSheetPackageItem[];
  total: number;
  error: string | null;
};

export function ClientPackagesPanel({
  client,
  locale,
  active,
  refreshKey,
  allowPurchase,
  onPurchaseSuccess,
}: ClientPackagesPanelProps) {
  const t = useTranslations("adminPages.clients");
  const tFinance = useTranslations("adminPages.finance");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const purchaseOpen =
    allowPurchase &&
    searchParams.get(CLIENT_ADD_PACKAGE_QUERY_KEY) === CLIENT_ADD_PACKAGE_QUERY_VALUE;
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(client.id);
  const [retryKey, setRetryKey] = useState(0);
  const [result, setResult] = useState<PackagesFetchResult | null>(null);
  const pageSize = DEFAULT_LIST_PAGE_SIZE;

  if (client.id !== prevClientId) {
    setPrevClientId(client.id);
    setPage(1);
  }

  const fetchKey = `${client.id}:${page}:${pageSize}:${refreshKey}:${retryKey}`;
  const loading = active && (result === null || result.key !== fetchKey);
  const items = result?.key === fetchKey ? result.items : [];
  const total = result?.key === fetchKey ? result.total : 0;
  const error = result?.key === fetchKey ? result.error : null;

  const openPurchase = () => {
    replaceAdminClientsSearchParams(pathname, router, (params) => {
      params.set(CLIENT_PROFILE_TAB_QUERY_KEY, CLIENT_SHEET_TAB_PACKAGES);
      params.set(CLIENT_ADD_PACKAGE_QUERY_KEY, CLIENT_ADD_PACKAGE_QUERY_VALUE);
    });
  };

  const closePurchase = () => {
    replaceAdminClientsSearchParams(pathname, router, (params) => {
      params.delete(CLIENT_ADD_PACKAGE_QUERY_KEY);
    });
  };

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    let cancelled = false;
    const offset = (page - 1) * pageSize;
    void apiFetch<ClientSheetPaginatedResponse<ClientSheetPackageItem>>(
      `/clients/${client.id}/packages?take=${pageSize}&offset=${offset}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setResult({
          key: fetchKey,
          items: payload.items,
          total: payload.total,
          error: null,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key: fetchKey,
            items: [],
            total: 0,
            error: err instanceof ApiError ? err.message : t("packages.loadError"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, client.id, fetchKey, page, pageSize, t]);

  function resolvePaymentMethodLabel(paymentMethod: string | null): string {
    if (paymentMethod === null || !isManualPaymentMethod(paymentMethod)) {
      return "—";
    }
    return tFinance(`paymentMethods.${paymentMethod}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
          {t("packages.heading")}
        </h3>
        {allowPurchase ? (
          <OmmButton type="button" variant="primary" onClick={openPurchase}>
            {t("packages.addPackage")}
          </OmmButton>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-sage-600">{t("packages.loading")}</p> : null}
      {!loading && error !== null ? (
        <div className="space-y-3 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3">
          <p className="text-sm text-rose-800">{error}</p>
          <OmmButton
            type="button"
            variant="secondary"
            onClick={() => setRetryKey((current) => current + 1)}
          >
            {t("packages.retry")}
          </OmmButton>
        </div>
      ) : null}
      {!loading && error === null && items.length === 0 ? (
        <p className="text-sm text-sage-600">{t("packages.empty")}</p>
      ) : null}

      {!loading && error === null && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className={ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}>{item.packageName}</p>
                  <p className="mt-1 text-sm text-sage-600">{item.categoryName}</p>
                </div>
                <span className="inline-flex rounded-full bg-mint-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-sage-800">
                  {item.status}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <PackageField
                  label={t("packages.activationDate")}
                  value={formatDateForUi(item.activationDate)}
                />
                <PackageField
                  label={t("packages.expirationDate")}
                  value={formatDateForUi(item.expirationDate)}
                />
                <PackageField
                  label={t("packages.totalSessions")}
                  value={item.isUnlimited ? t("packages.unlimited") : String(item.totalSessions ?? "—")}
                />
                <PackageField
                  label={t("packages.usedSessions")}
                  value={item.isUnlimited ? "—" : String(item.usedSessions ?? "—")}
                />
                <PackageField
                  label={t("packages.remainingSessions")}
                  value={item.isUnlimited ? t("packages.unlimited") : String(item.remainingSessions ?? "—")}
                />
                <PackageField
                  label={t("packages.paymentMethod")}
                  value={resolvePaymentMethodLabel(item.paymentMethod)}
                />
              </dl>
            </li>
          ))}
        </ul>
      ) : null}

      {total > pageSize ? (
        <OmmListPagination
          total={total}
          page={page}
          pageSize={pageSize}
          offset={(page - 1) * pageSize}
          onPageChange={setPage}
          disabled={loading}
        />
      ) : null}

      {purchaseOpen ? (
        <AdminClientPackagePurchaseSheet
          client={client}
          locale={locale}
          onClose={closePurchase}
          onSuccess={() => {
            closePurchase();
            onPurchaseSuccess();
          }}
        />
      ) : null}
    </div>
  );
}

function PackageField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={`mt-1 ${ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}`}>{value}</dd>
    </div>
  );
}
