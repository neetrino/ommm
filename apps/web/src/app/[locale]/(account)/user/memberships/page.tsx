import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { MembershipCheckoutButton } from "@/components/account/membership-checkout-button";
import { MembershipLifecycleButtons } from "@/components/account/membership-lifecycle-buttons";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
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
  isActive: boolean;
};

type MembershipRow = {
  id: string;
  status: string;
  sessionsRemaining: number | null;
  currentPeriodEnd: string;
  plan: { name: string };
};

type PaymentRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
};

export default async function UserMembershipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.memberships" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [plansRes, mineRes, payRes] = await Promise.all([
    serverApiJson<Plan[]>("/memberships/plans", cookie),
    serverApiJson<MembershipRow[]>("/memberships/me", cookie),
    serverApiJson<PaymentRow[]>("/payments/me", cookie),
  ]);

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <div className="max-w-4xl space-y-10">
        <AccountSection title={t("yourMemberships")}>
          {!mineRes.ok ? (
            <p className="text-sm text-amber-900">{t("signInToView")}</p>
          ) : mineRes.data.length === 0 ? (
            <p className="ommm-body-muted text-sm">{t("noActiveMembership")}</p>
          ) : (
            <ul className="space-y-3">
              {mineRes.data.map((m) => (
                <li key={m.id} className="ommm-stack-card">
                  <p className="font-medium text-sage-800">{m.plan.name}</p>
                  <p className="text-sm text-sage-500">
                    {m.status}
                    {m.sessionsRemaining != null
                      ? ` · ${t("sessionsLeft", { count: m.sessionsRemaining })}`
                      : ""}
                  </p>
                  <p className="text-xs text-sage-500/90">
                    {t("renewsEnds", {
                      date: formatDateForUi(m.currentPeriodEnd),
                    })}
                  </p>
                  <MembershipLifecycleButtons
                    membershipId={m.id}
                    status={m.status}
                  />
                </li>
              ))}
            </ul>
          )}
        </AccountSection>

        <AccountSection title={t("paymentHistory")}>
          {!payRes.ok ? (
            <p className="ommm-body-muted text-sm">{t("signInPayments")}</p>
          ) : payRes.data.length === 0 ? (
            <p className="ommm-body-muted text-sm">{t("noPayments")}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {payRes.data.map((p) => (
                <li key={p.id} className="ommm-inset-row">
                  <span className="font-medium tabular-nums text-sage-800">
                    <span className="text-black">֏</span>{" "}
                    {formatAmdFromCents(p.amountCents, locale).replace(/^֏\s*/, "")}
                  </span>
                  <span className="ml-2 text-sage-500">{p.status}</span>
                  {p.description ? (
                    <span className="ml-2 text-sage-500">{p.description}</span>
                  ) : null}
                  <span className="ml-2 text-xs text-sage-500">
                    {formatDateTimeForUi(p.createdAt, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AccountSection>

        <AccountSection title={t("plans")}>
          {!plansRes.ok ? (
            <p className="text-sm text-amber-900">{t("couldNotLoadPlans")}</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {plansRes.data
                .filter((p) => p.isActive)
                .map((plan) => (
                  <li key={plan.id} className="ommm-stack-card">
                    <p className="font-semibold text-sage-800">{plan.name}</p>
                    {plan.description ? (
                      <p className="mt-2 text-sm text-sage-500">
                        {plan.description}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm text-sage-700">
                      <span className="text-black">֏</span>{" "}
                      {formatAmdFromCents(plan.priceCents, locale).replace(/^֏\s*/, "")}{" "}
                      · {plan.billingPeriod} ·{" "}
                      {plan.isUnlimited
                        ? t("unlimitedClassesShort")
                        : t("sessionsPerPeriodShort", {
                            count: plan.sessionsPerMonth ?? 0,
                          })}
                    </p>
                    {mineRes.ok ? (
                      <div className="mt-4">
                        <MembershipCheckoutButton planId={plan.id} />
                      </div>
                    ) : (
                      <p className="ommm-body-muted mt-4 text-xs">
                        {t("logInToSubscribe")}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </AccountSection>
      </div>
    </AccountPageFrame>
  );
}
