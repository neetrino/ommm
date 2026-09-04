import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminPackagesSoldPanel } from "@/components/admin/admin-packages-sold-panel";
import {
  buildSoldPackagesAdminEndpoint,
  normalizePageSearchParams,
  parseSoldPackagesCategorySlug,
  parseSoldPackagesPageParams,
  parseSoldPackagesPlanId,
  parseSoldPackagesSearchQuery,
  type SoldPackageListPayload,
} from "@/components/admin/admin-packages-sold";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminPackagesSoldPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const search = normalizePageSearchParams(await searchParams);
  const t = await getTranslations({ locale, namespace: "adminPages.packages" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseSoldPackagesPageParams(search);
  const q = parseSoldPackagesSearchQuery(search);
  const planId = parseSoldPackagesPlanId(search);
  const categorySlug = parseSoldPackagesCategorySlug(search);
  const [soldRes, plansRes] = await Promise.all([
    serverApiJson<SoldPackageListPayload>(
      buildSoldPackagesAdminEndpoint(listPage.take, listPage.offset, q, planId, categorySlug),
      cookie,
    ),
    serverApiJson<AdminPackageRow[]>("/packages/admin/plans", cookie),
  ]);

  if (!soldRes.ok) {
    const status = soldRes.status;
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {status === 401 || status === 403 ? t("errorAuth") : t("errorLoad", { status })}
        </div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminPackagesSoldPanel
          locale={locale}
          initial={soldRes.data}
          initialQuery={q}
          initialPlanId={planId}
          initialCategorySlug={categorySlug}
          packagePlans={plansRes.ok ? plansRes.data : []}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
