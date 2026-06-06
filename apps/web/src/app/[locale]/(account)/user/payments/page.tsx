import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserPaymentsHistory } from "@/components/account/user-payments-history";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";
import type { UserPaymentsPayload } from "@/lib/user-package-types";

export default async function UserPaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "userPages.payments" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const paymentsRes = await serverApiJson<UserPaymentsPayload>(
    `/payments/me?take=${listPage.take}&offset=${listPage.offset}`,
    cookie,
  );

  if (!paymentsRes.ok) {
    return (
      <MemberContentFrame>
        <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
          {paymentsRes.status === 401
            ? t("signInRequired")
            : t("loadError", { status: paymentsRes.status })}
        </section>
      </MemberContentFrame>
    );
  }

  return (
    <MemberContentFrame>
      <UserPaymentsHistory locale={locale} initialPayments={paymentsRes.data} />
    </MemberContentFrame>
  );
}
