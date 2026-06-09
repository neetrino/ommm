import { getTranslations } from "next-intl/server";
import { NotificationPrefsFormDeferred } from "@/components/account/account-deferred-sections";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AccountSection } from "@/components/layout/account-section";
import { getCachedUsersMe } from "@/server/cached-users-me";

type MemberUserNotificationsRouteContentProps = {
  locale: string;
  embeddedInSheet?: boolean;
};

export async function MemberUserNotificationsRouteContent({
  locale,
  embeddedInSheet = false,
}: MemberUserNotificationsRouteContentProps) {
  const t = await getTranslations({ locale, namespace: "userPages.notifications" });
  const me = await getCachedUsersMe();

  if (!me.ok) {
    return <div className="app-alert-warn">{t("signIn")}</div>;
  }

  const prefs = me.data.notificationPrefs;
  if (prefs === undefined) {
    return <div className="app-alert-warn">{t("signIn")}</div>;
  }

  const preferences = (
    <AccountSection title={t("preferences")}>
      <div className="max-w-md">
        <NotificationPrefsFormDeferred initial={prefs} />
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
