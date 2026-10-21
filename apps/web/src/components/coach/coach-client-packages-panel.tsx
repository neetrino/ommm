"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CoachClientPackageCard } from "@/components/coach/coach-client-package-card";
import type { CoachClientPackageItem } from "@/components/coach/coach-client-package-card";
import type { ClientSheetPaginatedResponse } from "@/components/admin/admin-clients-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";

const COACH_CLIENT_PACKAGES_PAGE_SIZE = 8;

type FetchResult = {
  key: string;
  items: CoachClientPackageItem[];
  total: number;
  failed: boolean;
};

type CoachClientPackagesPanelProps = {
  clientId: string;
};

export function CoachClientPackagesPanel({ clientId }: CoachClientPackagesPanelProps) {
  const t = useTranslations("adminPages.clients");
  const packages = useCoachClientPackages(clientId);

  return (
    <section className="space-y-3">
      <PackageCards
        loading={packages.loading}
        failed={packages.failed}
        items={packages.items}
        loadingLabel={t("packages.loading")}
        emptyLabel={t("packages.empty")}
        errorLabel={t("packages.loadError")}
      />
      {packages.total > packages.pageSize ? (
        <OmmListPagination
          total={packages.total}
          page={packages.page}
          pageSize={packages.pageSize}
          offset={packages.offset}
          disabled={packages.loading}
          onPageChange={packages.setPage}
          scrollOnPageChange={false}
        />
      ) : null}
    </section>
  );
}

function useCoachClientPackages(clientId: string) {
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(clientId);
  const [result, setResult] = useState<FetchResult | null>(null);
  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setPage(1);
  }
  const pageSize = COACH_CLIENT_PACKAGES_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const fetchKey = `${clientId}:${page}:${pageSize}`;
  useCoachClientPackagesFetch(clientId, fetchKey, pageSize, offset, setResult);
  const current = result?.key === fetchKey ? result : null;
  return {
    page,
    setPage,
    pageSize,
    offset,
    loading: current === null,
    items: current?.items ?? [],
    total: current?.total ?? 0,
    failed: current?.failed ?? false,
  };
}

function useCoachClientPackagesFetch(
  clientId: string,
  fetchKey: string,
  pageSize: number,
  offset: number,
  setResult: (value: FetchResult) => void,
): void {
  useEffect(() => {
    let cancelled = false;
    const path = `/clients/coach-panel/${encodeURIComponent(clientId)}/packages?take=${pageSize}&offset=${offset}`;
    void apiFetch<ClientSheetPaginatedResponse<CoachClientPackageItem>>(path)
      .then((payload) => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: payload.items, total: payload.total, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: [], total: 0, failed: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, fetchKey, offset, pageSize, setResult]);
}

function PackageCards({
  loading,
  failed,
  items,
  loadingLabel,
  emptyLabel,
  errorLabel,
}: {
  loading: boolean;
  failed: boolean;
  items: CoachClientPackageItem[];
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
}) {
  if (loading) {
    return <p className="text-sm text-sage-500">{loadingLabel}</p>;
  }
  if (failed) {
    return <p className="text-sm text-sage-600">{errorLabel}</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-sage-500">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CoachClientPackageCard key={item.id} item={item} />
      ))}
    </div>
  );
}
