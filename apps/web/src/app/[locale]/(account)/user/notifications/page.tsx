import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AccountSection } from "@/components/layout/account-section";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  notificationPrefs: {
    bookingReminders: boolean;
    waitlistAlerts: boolean;
    promotions: boolean;
    communityUpdates: boolean;
  };
};

export default async function UserNotificationsPage({
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
      <div className="ommm-container">
        <div className="app-alert-warn">{t("signIn")}</div>
      </div>
    );
  }

  return (
    <MemberContentFrame>
      <div className="space-y-4">
        <AdminPageHero title={t("title")} description={t("description")} />
        <AccountSection title={t("preferences")}>
          <div className="max-w-md">
            <NotificationPrefsForm initial={res.data.notificationPrefs} />
          </div>
        </AccountSection>
      </div>
    </MemberContentFrame>
  );
}
