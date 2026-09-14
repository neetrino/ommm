"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { CLIENT_SHEET_TAB_PACKAGES } from "@/components/admin/admin-client-sheet-tabs";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  groupPaymentDueByClient,
  type DashboardStudioPaymentDueItem,
  type PaymentDueClientGroup,
} from "@/components/admin/admin-dashboard-payment-due";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { useRouter } from "@/i18n/navigation";

type AdminStudioPaymentDueViewProps = {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  locale: string;
  dashboardHref: string;
  loadError: string | null;
};

function PaymentDueClientCard({
  group,
  openLabel,
  openAriaLabel,
  onOpen,
}: {
  group: PaymentDueClientGroup;
  openLabel: string;
  openAriaLabel: string;
  onOpen: () => void;
}) {
  const initial = group.clientName.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <li>
      <button
        type="button"
        className={`${adminChrome.panel} flex w-full items-center gap-4 text-left hover:bg-white`}
        aria-label={openAriaLabel}
        onClick={onOpen}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-700">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-sage-900">
            {group.clientName}
          </span>
          <span className="mt-1 block space-y-0.5">
            {group.packages.map((item) => (
              <span
                key={item.packageId}
                className="block truncate text-sm text-sage-500"
              >
                {item.packageName}
              </span>
            ))}
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-sage-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-sage-800">
          {openLabel}
        </span>
      </button>
    </li>
  );
}

export function AdminStudioPaymentDueView({
  items,
  count,
  locale,
  dashboardHref,
  loadError,
}: AdminStudioPaymentDueViewProps) {
  const t = useTranslations("adminPages.paymentDue");
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const groups = groupPaymentDueByClient(items);
  const hasDueItems = count > 0 && items.length > 0;

  return (
    <>
      <AdminPageHero
        title={t("title")}
        titleBackHref={dashboardHref}
        titleBackLabel={t("backToDashboard")}
      />
      {loadError ? <p className="app-alert-warn mb-4 max-w-xl">{loadError}</p> : null}
      {hasDueItems ? (
        <ul className="space-y-3">
          {groups.map((group) => (
            <PaymentDueClientCard
              key={group.clientId}
              group={group}
              openLabel={t("open")}
              openAriaLabel={t("openClient", { name: group.clientName })}
              onOpen={() => setSelectedClientId(group.clientId)}
            />
          ))}
        </ul>
      ) : (
        <p className="ommm-body-muted" role="status">
          {t("empty")}
        </p>
      )}
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        initialTab={CLIENT_SHEET_TAB_PACKAGES}
        onClose={() => setSelectedClientId(null)}
        onChanged={() => router.refresh()}
      />
    </>
  );
}
