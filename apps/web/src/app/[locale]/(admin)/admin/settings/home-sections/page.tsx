import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminHomeSectionsSettingsForm } from "@/components/admin/admin-home-sections-settings-form";
import { serverApiJson } from "@/lib/server-api";
import type { HomePageSectionVisibility } from "@/lib/home-page-sections";
import { createDefaultHomePageSectionVisibility } from "@/lib/home-page-sections";

type HomeSectionsResponse = {
  sections: HomePageSectionVisibility;
};

export default async function AdminHomeSectionsSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.settings.homeSections" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<HomeSectionsResponse>("/studio/home-sections", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">{t("loadFailed", { status: res.status })}</div>
    );
  }

  return (
    <AdminHomeSectionsSettingsForm
      initial={res.data.sections ?? createDefaultHomePageSectionVisibility()}
    />
  );
}
