import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminStudioSettingsForm } from "@/components/admin/admin-studio-settings-form";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type StudioSettings = {
  studioName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappUrl: string | null;
  address: string | null;
  mapEmbedUrl: string | null;
  workingHours: string | null;
  socialLinksJson: string | null;
  cancellationHoursNotice: number;
  waitlistOfferMinutes: number;
};

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminActions.studio" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<StudioSettings>("/studio", cookie);
  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {t("loadFailed", { status: res.status })}
      </div>
    );
  }
  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <AdminStudioSettingsForm initial={res.data} />
    </AccountPageFrame>
  );
}
