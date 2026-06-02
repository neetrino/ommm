import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { PackageCheckoutButton } from "@/components/account/package-checkout-button";
import { PackageLifecycleButtons } from "@/components/account/package-lifecycle-buttons";
import { PackagePlanSwitchButton } from "@/components/account/package-plan-switch-button";
import { AccountSection } from "@/components/layout/account-page-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
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

type UserPackageRow = {
  id: string;
  status: string;
  sessionsRemaining: number | null;
  currentPeriodEnd: string;
  planId: string;
  plan: { id: string; name: string };
};

type PaymentRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  paymentMethod: string | null;
  createdAt: string;
  plan: { id: string; name: string } | null;
};

function formatUserPaymentStatus(
  status: string,
  paymentMethod: string | null,
  labels: {
    succeeded: string;
    failed: string;
    pending: string;
  },
): string {
  if (paymentMethod !== null) {
    if (status === "PENDING" || status === "SUCCEEDED") {
      return labels.succeeded;
    }
    if (status === "FAILED") {
      return labels.failed;
    }
  }
  if (status === "SUCCEEDED") {
    return labels.succeeded;
  }
  if (status === "FAILED") {
    return labels.failed;
  }
  if (status === "PENDING") {
    return labels.pending;
  }
  return status;
}

export default async function UserPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.packages" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [plansRes, mineRes, payRes] = await Promise.all([
    serverApiJson<Plan[]>("/packages/plans", cookie),
    serverApiJson<UserPackageRow[]>("/packages/me", cookie),
    serverApiJson<PaymentRow[]>("/payments/me", cookie),
  ]);

  return (
    <MemberContentFrame description={t("description")}>
      <div className="max-w-4xl space-y-10">
        <AccountSection title={t("yourPackages")}>
          {!mineRes.ok ? (
            <p className="text-sm text-amber-900">{t("signInToView")}</p>
          ) : mineRes.data.length === 0 ? (
            <p className="ommm-body-muted text-sm">{t("noActivePackage")}</p>
          ) : (
            <ul className="space-y-3">
              {mineRes.data.map((m) => (
                <li key={m.id} className="ommm-stack-card">
                  <p className="font-medium text-sage-800">{m.plan.name}</p>
                  <p className="text-sm text-sage-500">
                    {m.status === "PENDING"
                      ? t("statusPending")
                      : m.status}
                    {m.sessionsRemaining != null
                      ? ` · ${t("sessionsLeft", { count: m.sessionsRemaining })}`
                      : ""}
                  </p>
                  <p className="text-xs text-sage-500/90">
                    {t("renewsEnds", {
                      date: formatDateForUi(m.currentPeriodEnd),
                    })}
                  </p>
                  {m.status !== "PENDING" ? (
                    <PackageLifecycleButtons
                      userPackageId={m.id}
                      status={m.status}
                    />
                  ) : (
                    <p className="mt-2 text-xs text-sage-500">
                      {t("awaitingPaymentConfirmation")}
                    </p>
                  )}
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
                  <span className="ml-2 text-sage-500">
                    {formatUserPaymentStatus(p.status, p.paymentMethod, {
                      succeeded: t("paymentStatusSucceeded"),
                      failed: t("paymentStatusFailed"),
                      pending: t("paymentStatusSucceeded"),
                    })}
                  </span>
                  {p.paymentMethod ? (
                    <span className="ml-2 text-sage-500">
                      {t(`paymentMethods.${p.paymentMethod}`)}
                    </span>
                  ) : null}
                  {p.plan ? (
                    <span className="ml-2 text-sage-500">{p.plan.name}</span>
                  ) : p.description ? (
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
              {(() => {
                const activePackage =
                  mineRes.ok
                    ? mineRes.data.find((row) => row.status === "ACTIVE") ?? null
                    : null;
                return plansRes.data
                  .filter((p) => p.isActive)
                  .map((plan) => {
                    const pendingThisPlan =
                      mineRes.ok &&
                      mineRes.data.some(
                        (row) =>
                          row.status === "PENDING" && row.planId === plan.id,
                      );
                    const activeThisPlan =
                      activePackage !== null &&
                      activePackage.planId === plan.id &&
                      activePackage.status === "ACTIVE";
                    return (
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
                          {pendingThisPlan ? (
                            <p className="text-xs text-sage-600">
                              {t("awaitingPaymentConfirmation")}
                            </p>
                          ) : activeThisPlan ? (
                            <p className="text-xs text-sage-600">
                              {t("currentPlan")}
                            </p>
                          ) : activePackage !== null &&
                            activePackage.planId !== plan.id ? (
                            <PackagePlanSwitchButton
                              userPackageId={activePackage.id}
                              planId={plan.id}
                            />
                          ) : (
                            <PackageCheckoutButton
                              plan={{
                                id: plan.id,
                                name: plan.name,
                                description: plan.description,
                                priceCents: plan.priceCents,
                                currency: plan.currency,
                                billingPeriod: plan.billingPeriod,
                                isUnlimited: plan.isUnlimited,
                                sessionsPerMonth: plan.sessionsPerMonth,
                                periodDays: plan.periodDays,
                              }}
                              locale={locale}
                            />
                          )}
                        </div>
                      ) : (
                        <p className="ommm-body-muted mt-4 text-xs">
                          {t("logInToSubscribe")}
                        </p>
                      )}
                    </li>
                    );
                  });
              })()}
            </ul>
          )}
        </AccountSection>
      </div>
    </MemberContentFrame>
  );
}
