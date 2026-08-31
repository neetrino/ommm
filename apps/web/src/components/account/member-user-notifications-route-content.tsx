import { getTranslations } from "next-intl/server";
import { MemberUserNotificationsOffers } from "@/components/account/member-user-notifications-offers";
import { AccountSection } from "@/components/layout/account-section";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import { getCachedUsersMe } from "@/server/cached-users-me";

const DEFAULT_NOTIFICATION_PREFS = {
  bookingReminders: true,
  waitlistAlerts: true,
  promotions: false,
  communityUpdates: false,
  whatsappEnabled: true,
} as const;

type MemberUserNotificationsRouteContentProps = {
  locale: string;
};

export async function MemberUserNotificationsRouteContent({
  locale,
}: MemberUserNotificationsRouteContentProps) {
  const t = await getTranslations({ locale, namespace: "userPages.notifications" });
  const me = await getCachedUsersMe();

  if (!me.ok) {
    return (
      <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
        {t("signIn")}
      </section>
    );
  }

  const notificationPrefs = me.data.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS;

  return (
    <div className="space-y-8">
      <MemberUserNotificationsOffers />
      <AccountSection title={t("preferences")}>
        <div className="max-w-md">
          <NotificationPrefsForm initial={notificationPrefs} />
        </div>
      </AccountSection>
    </div>
  );
}
