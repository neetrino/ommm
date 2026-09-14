import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { dashboardHomeHref } from "@/components/admin/admin-dashboard-metrics.helpers";
import {
  STUDIO_PAYMENT_DUE_ENDPOINT,
  type DashboardStudioPaymentDueItem,
} from "@/components/admin/admin-dashboard-payment-due";
import { AdminStudioPaymentDueView } from "@/components/admin/admin-studio-payment-due-view";
import { serverApiJson } from "@/lib/server-api";

type StudioPaymentDuePayload = {
  count: number;
  items: DashboardStudioPaymentDueItem[];
};

type AdminStudioPaymentDuePageProps = {
  locale: string;
  includeFinance: boolean;
};

export async function AdminStudioPaymentDuePage({
  locale,
  includeFinance,
}: AdminStudioPaymentDuePageProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.paymentDue" });
  const cookie = (await headers()).get("cookie") ?? "";
  const response = await serverApiJson<StudioPaymentDuePayload>(
    STUDIO_PAYMENT_DUE_ENDPOINT,
    cookie,
  );
  const payload = response.ok ? response.data : { count: 0, items: [] };
  const loadError = response.ok
    ? null
    : response.status === 401 || response.status === 403
      ? t("errorAuth")
      : t("errorLoad", { status: response.status });

  return (
    <AdminContentFrame>
      <AdminStudioPaymentDueView
        items={payload.items}
        count={payload.count}
        locale={locale}
        dashboardHref={dashboardHomeHref(includeFinance)}
        loadError={loadError}
      />
    </AdminContentFrame>
  );
}
