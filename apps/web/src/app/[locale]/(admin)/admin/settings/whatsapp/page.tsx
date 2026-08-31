import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminWhatsappSettingsForm } from "@/components/admin/admin-whatsapp-settings-form";
import { serverApiJson } from "@/lib/server-api";
import type { WhatsappAdminSettings } from "@/lib/whatsapp-admin";

export default async function AdminWhatsappSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "adminPages.settings.whatsapp",
  });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<WhatsappAdminSettings>(
    "/whatsapp/admin/settings",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {t("loadFailed", { status: res.status })}
      </div>
    );
  }

  return <AdminWhatsappSettingsForm initial={res.data} />;
}
