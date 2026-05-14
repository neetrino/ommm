import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";

type PublicMembershipPlan = {
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
};

type HomeMembershipCard = {
  id: string;
  name: string;
  description: string;
  amount: string;
  periodLabel: string;
  features: string[];
  buttonLabel: string;
  isPopular: boolean;
};

function fallbackCards(t: Awaited<ReturnType<typeof getTranslations>>): HomeMembershipCard[] {
  return [
    {
      id: "starter",
      name: t("homeMembershipFallbackStarterName"),
      description: t("homeMembershipFallbackStarterDescription"),
      amount: "֏ 39",
      periodLabel: t("homeMembershipFallbackMonthly"),
      features: [
        t("homeMembershipFallbackFeature1"),
        t("homeMembershipFallbackFeature2"),
        t("homeMembershipFallbackFeature3"),
      ],
      buttonLabel: t("homeMembershipFallbackButton"),
      isPopular: false,
    },
    {
      id: "flow",
      name: t("homeMembershipFallbackFlowName"),
      description: t("homeMembershipFallbackFlowDescription"),
      amount: "֏ 79",
      periodLabel: t("homeMembershipFallbackMonthly"),
      features: [
        t("homeMembershipFallbackFeature4"),
        t("homeMembershipFallbackFeature5"),
        t("homeMembershipFallbackFeature6"),
      ],
      buttonLabel: t("homeMembershipFallbackButton"),
      isPopular: true,
    },
  ];
}

function toHomeCards(
  plans: PublicMembershipPlan[],
  locale: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
): HomeMembershipCard[] {
  return plans.map((plan) => {
    const amount = formatAmdFromCents(plan.priceCents, locale);

    const features =
      plan.features.length > 0
        ? plan.features
        : [t("membershipsSessionsCount", { count: 0 })];

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description ?? "",
      amount,
      periodLabel:
        plan.billingPeriod.length > 0
          ? plan.billingPeriod
          : t("membershipsPeriodDaysShort", { days: plan.periodDays }),
      features,
      buttonLabel: plan.buttonLabel,
      isPopular: plan.isPopular,
    };
  });
}

export async function HomeMembershipsSection({ locale }: { locale: string }) {
  const m = await getTranslations({ locale, namespace: "marketing" });
  const res = await serverApiJson<PublicMembershipPlan[]>("/memberships/plans", "");
  const activePlans = res.ok ? res.data.filter((plan) => plan.isActive) : [];
  const cards =
    activePlans.length > 0 ? toHomeCards(activePlans, locale, m) : fallbackCards(m);

  return (
    <section className="relative">
      <div className="ommm-container ommm-section">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="ommm-h2">{m("homeMembershipsTitle")}</h2>
          <p className="ommm-body mt-3">{m("homeMembershipsLead")}</p>
        </div>
        <ul className="mt-12 grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <li
              key={card.id}
              className={`ommm-card flex flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8 ${card.isPopular ? "ring-2 ring-sand-400/70" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="ommm-h3 text-sage-800">{card.name}</h3>
                {card.isPopular ? (
                  <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sand-800">
                    {m("homeMembershipPopularBadge")}
                  </span>
                ) : null}
              </div>
              {card.description.length > 0 ? (
                <p className="mt-3 text-sm leading-relaxed text-sage-500">{card.description}</p>
              ) : null}
              <p className="mt-6 font-serif text-3xl font-semibold tracking-tight text-sage-700">
                {card.amount}
              </p>
              <p className="mt-1 text-sm text-sage-500">{card.periodLabel}</p>
              <ul className="mt-6 space-y-2 text-sm text-sage-700">
                {card.features.map((feature) => (
                  <li key={`${card.id}-${feature}`} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-mint-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/memberships" className="ommm-cta-primary inline-flex w-full justify-center">
                  {card.buttonLabel}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
