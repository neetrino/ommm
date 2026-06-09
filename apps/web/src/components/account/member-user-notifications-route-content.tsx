import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AccountSection } from "@/components/layout/account-section";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  notificationPrefs: {
    bookingReminders: boolean;
    waitlistAlerts: boolean;
    promotions: boolean;
    communityUpdates: boolean;
  };
};

type MemberUserNotificationsRouteContentProps = {
  locale: string;
  embeddedInSheet?: boolean;
};

export async function MemberUserNotificationsRouteContent({
  locale,
  embeddedInSheet = false,
}: MemberUserNotificationsRouteContentProps) {
  const t = await getTranslations({ locale, namespace: "userPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return <div className="app-alert-warn">{t("signIn")}</div>;
  }

  const preferences = (
    <AccountSection title={t("preferences")}>
      <div className="max-w-md">
        <NotificationPrefsForm initial={res.data.notificationPrefs} />
      </div>
    </AccountSection>
  );

  if (embeddedInSheet) {
    return preferences;
  }

  return (
    <div className="space-y-4">
      <AdminPageHero title={t("title")} description={t("description")} />
      {preferences}
    </div>
  );
}
