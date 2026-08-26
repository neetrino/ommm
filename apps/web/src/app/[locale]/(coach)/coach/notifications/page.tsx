import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import { AccountSection } from "@/components/layout/account-section";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminStaffActivitySection } from "@/components/admin/admin-staff-activity-section";
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
  const t = await getTranslations({
    locale,
    namespace: "userPages.notifications",
  });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminStaffActivitySection />
      </Suspense>
      {res.ok ? (
        <div className="mt-8">
          <AccountSection title={t("preferences")}>
            <div className="max-w-md">
              <NotificationPrefsForm initial={res.data.notificationPrefs} />
            </div>
          </AccountSection>
        </div>
      ) : null}
    </AdminContentFrame>
  );
}
