import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { MemberUserNotificationsOffers } from "@/components/account/member-user-notifications-offers";
import { AccountSection } from "@/components/layout/account-section";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
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
};

export async function MemberUserNotificationsRouteContent({
  locale,
}: MemberUserNotificationsRouteContentProps) {
  const t = await getTranslations({ locale, namespace: "userPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
        {t("signIn")}
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <MemberUserNotificationsOffers />
      <AccountSection title={t("preferences")}>
        <div className="max-w-md">
          <NotificationPrefsForm initial={res.data.notificationPrefs} />
        </div>
      </AccountSection>
    </div>
  );
}
