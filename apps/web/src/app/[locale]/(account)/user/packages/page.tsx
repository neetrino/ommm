import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserPackageLifecycleActions } from "@/components/account/user-package-lifecycle-actions";
import { AccountSection } from "@/components/layout/account-page-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { PublicPackageCategoryCards } from "@/components/marketing/packages/public-package-category-cards";
import { formatDateForUi } from "@/lib/date-display";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";
import { serverApiJson, serverApiJsonPublic } from "@/lib/server-api";
import type { UserMembershipRow, UserPaymentRow } from "@/lib/user-package-types";

function isUserPackageStatus(value: string): value is UserMembershipRow["status"] {
  return (
    value === "ACTIVE" ||
    value === "PAUSED" ||
    value === "CANCELLED" ||
    value === "EXPIRED" ||
    value === "PENDING"
  );
}

function formatMembershipStatus(
  status: UserMembershipRow["status"],
  t: (key: string) => string,
): string {
  return t(`membershipStatus.${status}`);
}

function formatPaymentStatus(status: string, t: (key: string) => string): string {
  if (status === "SUCCEEDED") {
    return t("paymentStatusSucceeded");
  }
  if (status === "FAILED") {
    return t("paymentStatusFailed");
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
  const m = await getTranslations({ locale, namespace: "marketing" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [membershipsRes, plansRes, paymentsRes] = await Promise.all([
    serverApiJson<UserMembershipRow[]>("/packages/me", cookie),
    serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans"),
    serverApiJson<UserPaymentRow[]>("/payments/me", cookie),
  ]);

  const memberships = membershipsRes.ok ? membershipsRes.data : [];
  const categories = plansRes.ok
    ? groupVisiblePublicPackageCategories(
        plansRes.data.filter((plan) => plan.isActive).map(normalizePublicPackagePlan),
      )
    : [];
  const payments = paymentsRes.ok ? paymentsRes.data : [];

  return (
    <MemberContentFrame description={m("packagesPageLead")}>
      <div className="space-y-10">
        <AccountSection title={t("yourPackages")}>
          <div id="your-packages">
            {!membershipsRes.ok ? (
              <p className="ommm-body-muted text-sm">{t("signInToView")}</p>
            ) : memberships.length === 0 ? (
              <p className="ommm-body-muted text-sm">{t("noActivePackage")}</p>
            ) : (
              <ul className="max-w-4xl space-y-4">
                {memberships.map((membership) => {
                  const status = isUserPackageStatus(membership.status)
                    ? membership.status
                    : "ACTIVE";
                  const sessionsLabel =
                    membership.sessionsRemaining === null
                      ? m("packagesSessionsUnlimited")
                      : t("sessionsLeft", { count: membership.sessionsRemaining });
                  return (
                    <li
                      key={membership.id}
                      className="ommm-list-row flex-col items-stretch gap-3"
                    >
                      <div className="w-full">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="font-medium text-sage-800">{membership.plan.name}</p>
                          <span className={memberStatusClass(status)}>
                            {formatMembershipStatus(status, t)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-sage-500">
                          {membership.plan.categoryName} ·{" "}
                          {formatAmdFromCents(membership.plan.priceCents, locale)} ·{" "}
                          {m("packagesPeriodDaysShort", { days: membership.plan.periodDays })}
                        </p>
                        <p className="mt-2 text-sm text-sage-600">{sessionsLabel}</p>
                        <p className="mt-1 text-sm text-sage-500">
                          {t("renewsEnds", {
                            date: formatDateForUi(membership.currentPeriodEnd),
                          })}
                        </p>
                        {status === "PENDING" ? (
                          <p className="mt-2 text-sm text-sage-600">
                            {t("awaitingPaymentConfirmation")}
                          </p>
                        ) : null}
                        <UserPackageLifecycleActions
                          userPackageId={membership.id}
                          status={status}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </AccountSection>

        <section>
          <h2 className="ommm-h3 text-sage-800">{m("packagesPageTitle")}</h2>
          {!plansRes.ok ? (
            <p className="ommm-body-muted mt-4 text-sm">{m("packagesError")}</p>
          ) : (
            <div className="mt-6">
              <PublicPackageCategoryCards
                locale={locale}
                categories={categories}
                audience="member"
              />
            </div>
          )}
        </section>

        <AccountSection title={t("paymentHistory")}>
          {!paymentsRes.ok ? (
            <p className="ommm-body-muted text-sm">{t("signInPayments")}</p>
          ) : payments.length === 0 ? (
            <p className="ommm-body-muted text-sm">{t("noPayments")}</p>
          ) : (
            <ul className="max-w-4xl space-y-2 text-sm">
              {payments.map((payment) => {
                const methodKey = payment.paymentMethod ?? "";
                const methodLabel =
                  methodKey.length > 0 &&
                  ["CASH", "CARD", "BANK_TRANSFER", "OTHER"].includes(methodKey)
                    ? t(`paymentMethods.${methodKey}`)
                    : null;
                return (
                  <li key={payment.id} className="ommm-inset-row text-sage-700">
                    {formatAmdFromCents(payment.amountCents, locale)} ·{" "}
                    {formatPaymentStatus(payment.status, t)}
                    {methodLabel !== null ? ` · ${methodLabel}` : ""} ·{" "}
                    {formatDateForUi(payment.createdAt)}
                    {payment.description ? ` · ${payment.description}` : ""}
                  </li>
                );
              })}
            </ul>
          )}
        </AccountSection>
      </div>
    </MemberContentFrame>
  );
}

function memberStatusClass(status: UserMembershipRow["status"]): string {
  const base =
    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]";
  if (status === "ACTIVE") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (status === "PENDING") {
    return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  }
  if (status === "PAUSED") {
    return `${base} border-sand-300 bg-sand-50 text-sage-700`;
  }
  return `${base} border-white/70 bg-white/70 text-sage-600`;
}
