import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
  periodDays: number;
  billingPeriod: string;
  buttonLabel: string;
  isPopular: boolean;
  isActive: boolean;
};

export default async function MembershipsMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const res = await serverApiJson<Plan[]>("/memberships/plans", "");

  const activePlans = res.ok ? res.data.filter((p) => p.isActive) : [];

  return (
    <MarketingPageFrame
      title={m("membershipsPageTitle")}
      lede={m("membershipsPageLead")}
    >
      {!res.ok ? (
        <p className="app-alert-warn mt-12" role="status">
          {m("membershipsError")}
        </p>
      ) : activePlans.length === 0 ? (
        <p
          className="ommm-card mt-12 p-5 text-sm text-sage-500 sm:p-6"
          role="status"
        >
          {m("membershipsEmpty")}
        </p>
      ) : (
        <>
          <ul className="mt-12 grid gap-6 lg:grid-cols-2">
            {activePlans.map((plan) => {
              const amount = formatAmdFromCents(plan.priceCents, locale);
              const sessionsLabel = plan.isUnlimited
                ? m("membershipsSessionsUnlimited")
                : m("membershipsSessionsCount", {
                    count: plan.sessionsPerMonth ?? 0,
                  });
              return (
                <li
                  key={plan.id}
                  className={`ommm-card ommm-membership-card-hover flex flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8 ${plan.isPopular ? "ring-2 ring-sand-400/70" : ""}`}
                >
                  <h2 className="ommm-h3 text-sage-800">{plan.name}</h2>
                  {plan.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-sage-500">
                      {plan.description}
                    </p>
                  ) : null}
                  <p className="mt-6 font-serif text-3xl font-semibold tracking-tight text-sage-700">
                    <span className="mr-1.5 text-black">{amount.startsWith("֏") ? "֏" : ""}</span>
                    {m("membershipsPriceLine", {
                      amount: amount.startsWith("֏") ? amount.slice(1).trimStart() : amount,
                    })}
                  </p>
                  <p className="mt-2 text-sm text-sage-500">
                    {plan.billingPeriod} · {m("membershipsPeriodDaysShort", { days: plan.periodDays })}
                  </p>
                  <p className="mt-4 text-sm font-medium text-sage-700">
                    {sessionsLabel}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 border-t border-white/50 pt-6 sm:flex-row">
                    <Link
                      href="/login"
                      className="ommm-cta-primary flex-1 text-center"
                    >
                      {plan.buttonLabel || m("membershipsSubscribeCta")}
                    </Link>
                    <Link
                      href="/user/memberships"
                      className="ommm-cta-ghost flex-1 text-center"
                    >
                      {m("membershipsAccountCta")}
                    </Link>
                  </div>
                  <p className="mt-4 text-center text-xs text-sage-500">
                    {m("membershipsLoginHint")}
                  </p>
                </li>
              );
            })}
          </ul>
          <section className="mt-16 max-w-3xl">
            <h2 className="ommm-h2 text-sage-800">{m("membershipsFaqTitle")}</h2>
            <dl className="mt-6 space-y-6 text-sm text-sage-700">
              <div>
                <dt className="font-semibold text-sage-800">
                  {m("membershipsFaqPauseQuestion")}
                </dt>
                <dd className="mt-1 text-sage-600">
                  {m("membershipsFaqPauseAnswer")}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-sage-800">
                  {m("membershipsFaqBillingQuestion")}
                </dt>
                <dd className="mt-1 text-sage-600">
                  {m("membershipsFaqBillingAnswer")}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-sage-800">
                  {m("membershipsFaqWaitlistQuestion")}
                </dt>
                <dd className="mt-1 text-sage-600">
                  {m("membershipsFaqWaitlistAnswer")}
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </MarketingPageFrame>
  );
}
