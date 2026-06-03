import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserPaymentsHistory } from "@/components/account/user-payments-history";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { serverApiJson } from "@/lib/server-api";
import type { UserPaymentRow } from "@/lib/user-package-types";

export default async function UserPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.payments" });
  const cookie = (await headers()).get("cookie") ?? "";
  const paymentsRes = await serverApiJson<UserPaymentRow[]>("/payments/me", cookie);

  if (!paymentsRes.ok) {
    return (
      <MemberContentFrame description={t("description")}>
        <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
          {paymentsRes.status === 401
            ? t("signInRequired")
            : t("loadError", { status: paymentsRes.status })}
        </section>
      </MemberContentFrame>
    );
  }

  return (
    <MemberContentFrame description={t("description")}>
      <UserPaymentsHistory locale={locale} payments={paymentsRes.data} />
    </MemberContentFrame>
  );
}
