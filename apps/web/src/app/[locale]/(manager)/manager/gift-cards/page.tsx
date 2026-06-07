import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminGiftCardsManagement } from "@/components/admin/admin-gift-cards-management";
import {
  buildAdminGiftCardsListEndpoint,
  parseAdminGiftCardsPageParams,
  type AdminGiftCardsListPayload,
} from "@/components/admin/admin-gift-cards-query";
import { parseGiftCardFiltersFromSearch } from "@/components/admin/admin-gift-cards-url";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { parseAdminGiftCardsViewMode } from "@/lib/admin-gift-cards-view-preference";
import { serverApiJson } from "@/lib/server-api";

export default async function ManagerGiftCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.giftCards" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";
  const normalizedSearch = Object.fromEntries(
    Object.entries(search).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as Record<string, string | undefined>;
  const listPage = parseAdminGiftCardsPageParams(normalizedSearch);
  const initialFilters = parseGiftCardFiltersFromSearch(search);
  const batchesEndpoint = buildAdminGiftCardsListEndpoint(
    listPage.take,
    listPage.offset,
    initialFilters,
  );
  const res = await serverApiJson<AdminGiftCardsListPayload>(batchesEndpoint, cookie);

  if (!res.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {res.status === 401 || res.status === 403
            ? t("errorAuth")
            : t("errorLoad", { status: res.status })}
        </div>
      </AdminContentFrame>
    );
  }

  const initialViewMode = parseAdminGiftCardsViewMode(search.view);

  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminGiftCardsManagement
          initial={res.data}
          assignableUsers={[]}
          locale={locale}
          initialFilters={initialFilters}
          initialViewMode={initialViewMode}
          variant="staff"
          staffBanner={tManager("readOnlyHint")}
          readOnly
        />
      </Suspense>
    </AdminContentFrame>
  );
}
