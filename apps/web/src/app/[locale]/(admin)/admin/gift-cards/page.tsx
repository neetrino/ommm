import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminGiftCardsManagement } from "@/components/admin/admin-gift-cards-management";
import type { AdminGiftCardRow } from "@/components/admin/admin-gift-cards-types";
import {
  giftCardFiltersQueryKey,
  parseGiftCardFiltersFromSearch,
} from "@/components/admin/admin-gift-cards-url";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminGiftCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<AdminGiftCardRow[]>("/gift-cards/admin", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: res.status })}
      </div>
    );
  }

  const initialFilters = parseGiftCardFiltersFromSearch(search);

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <Suspense fallback={null}>
        <AdminGiftCardsManagement
          key={giftCardFiltersQueryKey(initialFilters)}
          giftCards={res.data}
          locale={locale}
          initialFilters={initialFilters}
        />
      </Suspense>
    </AccountPageFrame>
  );
}
