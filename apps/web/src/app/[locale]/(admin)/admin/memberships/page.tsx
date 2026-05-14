import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminMembershipPlanActions } from "@/components/admin/admin-membership-plan-actions";
import { AdminMembershipPlansShell } from "@/components/admin/admin-membership-plans-shell";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type MembershipPlanAdminRow = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  features: string[];
  buttonLabel: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
};

export default async function AdminMembershipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.memberships" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MembershipPlanAdminRow[]>("/memberships/admin/plans", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: res.status })}
      </div>
    );
  }

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <AdminMembershipPlansShell>
        <div className={adminChrome.tableWrap}>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colName")}</th>
                <th className={adminChrome.th}>{t("colPricing")}</th>
                <th className={adminChrome.th}>{t("colPeriod")}</th>
                <th className={adminChrome.th}>{t("colStatus")}</th>
                <th className={adminChrome.th}>{t("colOrder")}</th>
                <th className={adminChrome.th}>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {res.data.map((plan) => (
                <tr key={plan.id} className={adminChrome.tr}>
                  <td className={adminChrome.tdStrong}>
                    <div className="font-medium">{plan.name}</div>
                    {plan.description ? (
                      <div className={adminChrome.metaText}>{plan.description}</div>
                    ) : null}
                  </td>
                  <td className={adminChrome.td}>
                    <span className="tabular-nums">
                      {(plan.priceCents / 100).toFixed(2)} {plan.currency}
                    </span>
                  </td>
                  <td className={adminChrome.td}>
                    {plan.billingPeriod} · {plan.periodDays}d
                  </td>
                  <td className={adminChrome.td}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${plan.isActive ? "bg-mint-500" : "bg-sage-300"}`}
                        aria-hidden
                      />
                      {plan.isActive ? t("statusActive") : t("statusInactive")}
                    </span>
                    {plan.isPopular ? (
                      <span className="ml-2 rounded-full bg-sand-100 px-2 py-0.5 text-xs text-sand-800">
                        {t("popularBadge")}
                      </span>
                    ) : null}
                  </td>
                  <td className={adminChrome.td}>{plan.displayOrder}</td>
                  <td className={adminChrome.td}>
                    <AdminMembershipPlanActions
                      planId={plan.id}
                      isActive={plan.isActive}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminMembershipPlansShell>
    </AccountPageFrame>
  );
}
