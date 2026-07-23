import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import { AccountSection } from "@/components/layout/account-section";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
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
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{t("signIn")}</div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <StaffListPageLayout title={t("title")} description={t("description")}>
        <AccountSection title={t("preferences")}>
          <div className="max-w-md">
            <NotificationPrefsForm initial={res.data.notificationPrefs} />
          </div>
        </AccountSection>
      </StaffListPageLayout>
    </AdminContentFrame>
  );
}
