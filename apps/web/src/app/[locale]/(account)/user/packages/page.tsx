import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserPackagesSection } from "@/components/account/user-packages-section";
import { AccountSection } from "@/components/layout/account-page-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { serverApiJson } from "@/lib/server-api";
import type { UserMembershipRow, UserPaymentRow } from "@/lib/user-package-types";
import { formatAmdFromCents } from "@/lib/price-amd";
import { formatDateForUi } from "@/lib/date-display";

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

  const [membershipsRes, paymentsRes] = await Promise.all([
    serverApiJson<UserMembershipRow[]>("/packages/me", cookie),
    serverApiJson<UserPaymentRow[]>("/payments/me", cookie),
  ]);

  const memberships = membershipsRes.ok ? membershipsRes.data : [];
  const payments = paymentsRes.ok ? paymentsRes.data : [];

  return (
    <MemberContentFrame description={m("packagesPageLead")}>
      <div className="max-w-6xl space-y-10">
        <AccountSection title={t("yourPackages")}>
          <UserPackagesSection
            locale={locale}
            memberships={memberships}
            apiOk={membershipsRes.ok}
          />
        </AccountSection>

        <AccountSection title={t("paymentHistory")}>
          {!paymentsRes.ok ? (
            <div className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
              <p className="ommm-body-muted text-sm">{t("signInPayments")}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
              <p className="ommm-body-muted text-sm">{t("noPayments")}</p>
            </div>
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
