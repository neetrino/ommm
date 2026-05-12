import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
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
              const amount = currency.format(plan.priceCents / 100);
              const sessionsLabel = plan.isUnlimited
                ? m("membershipsSessionsUnlimited")
                : m("membershipsSessionsCount", {
                    count: plan.sessionsPerMonth ?? 0,
                  });
              return (
                <li
                  key={plan.id}
                  className="ommm-card flex flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8 ommm-marketing-card-hover"
                >
                  <h2 className="ommm-h3 text-sage-800">{plan.name}</h2>
                  {plan.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-sage-500">
                      {plan.description}
                    </p>
                  ) : null}
                  <p className="mt-6 font-serif text-3xl font-semibold tracking-tight text-sage-700">
                    {m("membershipsPriceLine", { amount })}
                  </p>
                  <p className="mt-2 text-sm text-sage-500">
                    {m("membershipsPeriodDays", { days: plan.periodDays })}
                  </p>
                  <p className="mt-4 text-sm font-medium text-sage-700">
                    {sessionsLabel}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 border-t border-white/50 pt-6 sm:flex-row">
                    <Link
                      href="/login"
                      className="ommm-cta-primary flex-1 text-center"
                    >
                      {m("membershipsSubscribeCta")}
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
          <section className="mt-16">
            <h2 className="ommm-h2 text-sage-800">Compare plans</h2>
            <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/60 bg-white/80 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)]">
              <table className="min-w-full text-left text-sm text-sage-700">
                <thead className="border-b border-sage-200/80 bg-sage-50/80 text-xs uppercase text-sage-500">
                  <tr>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-sage-100/80">
                      <td className="px-4 py-3 font-medium text-sage-900">
                        {plan.name}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {currency.format(plan.priceCents / 100)}
                      </td>
                      <td className="px-4 py-3">{plan.periodDays} days</td>
                      <td className="px-4 py-3">
                        {plan.isUnlimited
                          ? m("membershipsSessionsUnlimited")
                          : m("membershipsSessionsCount", {
                              count: plan.sessionsPerMonth ?? 0,
                            })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="mt-16 max-w-3xl">
            <h2 className="ommm-h2 text-sage-800">FAQ</h2>
            <dl className="mt-6 space-y-6 text-sm text-sage-700">
              <div>
                <dt className="font-semibold text-sage-800">
                  Can I pause my membership?
                </dt>
                <dd className="mt-1 text-sage-600">
                  Yes — members can pause from their account when the plan
                  supports it; the studio team can also help from the desk.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-sage-800">
                  How does billing work?
                </dt>
                <dd className="mt-1 text-sage-600">
                  Checkout runs through Stripe when enabled in your environment.
                  You will see successful charges in your account payment history.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-sage-800">
                  What if a class is full?
                </dt>
                <dd className="mt-1 text-sage-600">
                  Join the waitlist from the schedule — we notify you when a spot
                  opens, with a limited time to confirm.
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </MarketingPageFrame>
  );
}
