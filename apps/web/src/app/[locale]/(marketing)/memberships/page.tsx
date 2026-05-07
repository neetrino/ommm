import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serverApiJson } from "@/lib/server-api";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
  periodDays: number;
  isActive: boolean;
};

export default async function MembershipsMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations("marketing");
  const res = await serverApiJson<Plan[]>("/memberships/plans", "");

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <h1 className="app-page-heading">{m("membershipsPageTitle")}</h1>
      <p className="app-lede">{m("membershipsPageLead")}</p>

      {!res.ok ? (
        <p className="app-alert-warn mt-10" role="status">
          {m("membershipsError")}
        </p>
      ) : res.data.filter((p) => p.isActive).length === 0 ? (
        <p className="app-alert-info mt-10" role="status">
          {m("membershipsEmpty")}
        </p>
      ) : (
        <ul className="mt-12 grid gap-6 lg:grid-cols-2">
          {res.data
            .filter((p) => p.isActive)
            .map((plan) => {
              const amount = currency.format(plan.priceCents / 100);
              const sessionsLabel = plan.isUnlimited
                ? m("membershipsSessionsUnlimited")
                : m("membershipsSessionsCount", {
                    count: plan.sessionsPerMonth ?? 0,
                  });
              return (
                <li
                  key={plan.id}
                  className="app-surface-card flex flex-col p-6 sm:p-8"
                >
                  <h2 className="text-xl font-semibold text-zinc-900">
                    {plan.name}
                  </h2>
                  {plan.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                      {plan.description}
                    </p>
                  ) : null}
                  <p className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900">
                    {m("membershipsPriceLine", { amount })}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {m("membershipsPeriodDays", { days: plan.periodDays })}
                  </p>
                  <p className="mt-4 text-sm font-medium text-zinc-700">
                    {sessionsLabel}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row">
                    <Link
                      href="/login"
                      className="app-btn-primary flex-1 text-center"
                    >
                      {m("membershipsSubscribeCta")}
                    </Link>
                    <Link
                      href="/account/memberships"
                      className="app-btn-secondary flex-1 text-center"
                    >
                      {m("membershipsAccountCta")}
                    </Link>
                  </div>
                  <p className="mt-4 text-center text-xs text-zinc-500">
                    {m("membershipsLoginHint")}
                  </p>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
