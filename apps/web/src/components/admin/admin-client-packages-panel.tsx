"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ClientDetail,
  ClientSheetPackageItem,
  ClientSheetPaginatedResponse,
} from "@/components/admin/admin-clients-types";
import { AdminClientPackagePurchaseSheet } from "@/components/admin/admin-client-package-purchase-sheet";
import {
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
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
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(client.id);
  const [items, setItems] = useState<ClientSheetPackageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const pageSize = DEFAULT_LIST_PAGE_SIZE;

  if (client.id !== prevClientId) {
    setPrevClientId(client.id);
    setPage(1);
  }

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * pageSize;
    try {
      const payload = await apiFetch<ClientSheetPaginatedResponse<ClientSheetPackageItem>>(
        `/clients/${client.id}/packages?take=${pageSize}&offset=${offset}`,
      );
      setItems(payload.items);
      setTotal(payload.total);
    } catch (err) {
      setItems([]);
      setTotal(0);
      setError(err instanceof ApiError ? err.message : t("packages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [client.id, page, pageSize, t]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    void loadPackages();
    return undefined;
  }, [active, loadPackages, refreshKey]);

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
          <OmmButton type="button" variant="primary" onClick={() => setPurchaseOpen(true)}>
            {t("packages.addPackage")}
          </OmmButton>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-sage-600">{t("packages.loading")}</p> : null}
      {!loading && error !== null ? (
        <div className="space-y-3 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3">
          <p className="text-sm text-rose-800">{error}</p>
          <OmmButton type="button" variant="secondary" onClick={() => void loadPackages()}>
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

      {purchaseOpen && allowPurchase ? (
        <AdminClientPackagePurchaseSheet
          client={client}
          locale={locale}
          onClose={() => setPurchaseOpen(false)}
          onSuccess={() => {
            setPurchaseOpen(false);
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
