import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserPaymentsHistoryDeferred } from "@/components/account/account-deferred-sections";
import { parseListPageParams } from "@/lib/list-pagination";
import { readUserListOrderFromSearch } from "@/lib/user-list-order-url";
import { serverApiJson } from "@/lib/server-api";
import type { UserPaymentsPayload } from "@/lib/user-package-types";

type MemberUserPaymentsRouteContentProps = {
  locale: string;
  search: Record<string, string | undefined>;
  embeddedInSheet?: boolean;
};

export async function MemberUserPaymentsRouteContent({
  locale,
  search,
  embeddedInSheet = false,
}: MemberUserPaymentsRouteContentProps) {
  const t = await getTranslations({ locale, namespace: "userPages.payments" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const order = readUserListOrderFromSearch(search, "date", "newest");
  const orderParam = order !== "newest" ? `&order=${order}` : "";
  const paymentsRes = await serverApiJson<UserPaymentsPayload>(
    `/payments/me?take=${listPage.take}&offset=${listPage.offset}${orderParam}`,
    cookie,
  );

  if (!paymentsRes.ok) {
    return (
      <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
        {paymentsRes.status === 401
          ? t("signInRequired")
          : t("loadError", { status: paymentsRes.status })}
      </section>
    );
  }

  return (
    <UserPaymentsHistoryDeferred
      locale={locale}
      initialPayments={paymentsRes.data}
      embeddedInSheet={embeddedInSheet}
    />
  );
}
