import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserMembershipListItem } from "@/components/account/user-membership-list-item";
import { AccountSection } from "@/components/layout/account-page-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { PublicPackageCategoryCards } from "@/components/marketing/packages/public-package-category-cards";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";
import { serverApiJson, serverApiJsonPublic } from "@/lib/server-api";
import type { UserMembershipRow, UserPaymentRow } from "@/lib/user-package-types";
import { formatAmdFromCents } from "@/lib/price-amd";
import { formatDateForUi } from "@/lib/date-display";

function isUserPackageStatus(value: string): value is UserMembershipRow["status"] {
  return (
    value === "ACTIVE" ||
    value === "PAUSED" ||
    value === "CANCELLED" ||
    value === "EXPIRED" ||
    value === "PENDING"
  );
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
    serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans", {
      cacheMode: "no-store",
    }),
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
                  return (
                    <UserMembershipListItem
                      key={membership.id}
                      membership={membership}
                      locale={locale}
                      status={status}
                    />
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
