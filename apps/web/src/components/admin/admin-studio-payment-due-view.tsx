"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { CLIENT_SHEET_TAB_PACKAGES } from "@/components/admin/admin-client-sheet-tabs";
import {
  groupPaymentDueByClient,
  type DashboardStudioPaymentDueItem,
} from "@/components/admin/admin-dashboard-payment-due";
import { PaymentDueClientCard } from "@/components/admin/admin-payment-due-client-card";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { useRouter } from "@/i18n/navigation";

type AdminStudioPaymentDueViewProps = {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  locale: string;
  dashboardHref: string;
  loadError: string | null;
};

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
        <ul className="grid auto-rows-fr grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-5">
          {groups.map((group) => (
            <PaymentDueClientCard
              key={group.clientId}
              group={group}
              boughtLabel={t("bought")}
              moreCountLabel={(extra) => t("morePackages", { count: extra })}
              openLabel={t("openClient", { name: group.clientName })}
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
