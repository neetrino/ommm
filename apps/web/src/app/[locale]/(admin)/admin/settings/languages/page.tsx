import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminEnabledLocalesSettingsForm } from "@/components/admin/admin-enabled-locales-settings-form";
import {
  createDefaultEnabledLocales,
  normalizeEnabledLocales,
  type EnabledLocalesMap,
} from "@/lib/enabled-locales";
import { serverApiJson } from "@/lib/server-api";

type EnabledLocalesResponse = {
  locales: EnabledLocalesMap;
};

export default async function AdminLanguagesSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.settings.languages" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<EnabledLocalesResponse>("/studio/enabled-locales", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">{t("loadFailed", { status: res.status })}</div>
    );
  }

  return (
    <Suspense fallback={null}>
      <AdminEnabledLocalesSettingsForm
        initial={normalizeEnabledLocales(
          res.data.locales ?? createDefaultEnabledLocales(),
        )}
      />
    </Suspense>
  );
}
