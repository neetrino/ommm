import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  notificationPrefs: {
    bookingReminders: boolean;
    waitlistAlerts: boolean;
    promotions: boolean;
    communityUpdates: boolean;
  };
};

export default async function CoachNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">{t("signIn")}</div>
      </div>
    );
  }

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <AccountSection title={t("preferences")}>
        <div className="max-w-md">
          <NotificationPrefsForm initial={res.data.notificationPrefs} />
        </div>
      </AccountSection>
    </AccountPageFrame>
  );
}
