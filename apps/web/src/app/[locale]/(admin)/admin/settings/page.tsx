import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminStudioSettingsForm } from "@/components/admin/admin-studio-settings-form";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { serverApiJson } from "@/lib/server-api";
import type { StudioPublicSettings } from "@/lib/studio-social-links";

export default async function AdminSettingsPage({
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
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{t("loadFailed", { status: res.status })}</div>
      </AdminContentFrame>
    );
  }
  return (
    <AdminContentFrame description={t("description")}>
      <AdminStudioSettingsForm initial={res.data} />
    </AdminContentFrame>
  );
}
