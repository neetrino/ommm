import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminMembershipPlanActions } from "@/components/admin/admin-membership-plan-actions";
import { AdminMembershipPlansShell } from "@/components/admin/admin-membership-plans-shell";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
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
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:gap-6">
          {res.data.map((plan) => {
            const amount = formatAmdFromCents(plan.priceCents, locale);
            const features = plan.features.length > 0 ? plan.features : [];
            return (
              <article
                key={plan.id}
                className={`ommm-card min-w-0 flex flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-7 ${plan.isPopular ? "ring-2 ring-sand-400/70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="ommm-h3 break-words text-sage-800">{plan.name}</h2>
                  <div className="flex items-center gap-2">
                    {plan.isPopular ? (
                      <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sand-800">
                        {t("popularBadge")}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${plan.isActive ? "bg-mint-100 text-mint-800" : "bg-sage-100 text-sage-700"}`}
                    >
                      {plan.isActive ? t("statusActive") : t("statusInactive")}
                    </span>
                  </div>
                </div>

                {plan.description ? (
                  <p className="mt-3 break-words text-sm leading-relaxed text-sage-500">
                    {plan.description}
                  </p>
                ) : (
                  <div className="mt-3 h-5" aria-hidden />
                )}

                <p className="mt-6 font-serif text-3xl font-semibold tracking-tight text-sage-700">
                  {amount}
                </p>
                <p className="mt-2 text-sm text-sage-500">
                  {plan.billingPeriod} · {plan.periodDays} days
                </p>

                {features.length > 0 ? (
                  <ul className="mt-5 space-y-2 text-sm text-sage-700">
                    {features.map((feature) => (
                      <li key={`${plan.id}-${feature}`} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-mint-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-sage-500">
                    {t("noFeatures")}
                  </p>
                )}

                <div className="mt-8 border-t border-white/50 pt-5">
                  <div className="mb-3 text-xs uppercase tracking-wide text-sage-500">
                    {t("colOrder")}: {plan.displayOrder}
                  </div>
                  <AdminMembershipPlanActions planId={plan.id} isActive={plan.isActive} />
                </div>
              </article>
            );
          })}
        </div>
      </AdminMembershipPlansShell>
    </AccountPageFrame>
  );
}
