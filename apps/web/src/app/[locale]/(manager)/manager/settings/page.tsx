import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminStudioSettingsOverview } from "@/components/admin/admin-studio-settings-overview";
import { serverApiJson } from "@/lib/server-api";
import type { StudioPublicSettings } from "@/lib/studio-social-links";

export default async function ManagerSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminActions.studio" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<StudioPublicSettings>("/studio", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">{t("loadFailed", { status: res.status })}</div>
    );
  }

  return <AdminStudioSettingsOverview initial={res.data} />;
}
