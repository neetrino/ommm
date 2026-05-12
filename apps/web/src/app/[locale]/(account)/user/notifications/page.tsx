import { headers } from "next/headers";
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

export default async function UserNotificationsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">Sign in to manage notifications.</div>
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Notifications"
      description="Choose how Ommm reaches you. Changes save immediately."
    >
      <AccountSection title="Preferences">
        <div className="max-w-md">
          <NotificationPrefsForm initial={res.data.notificationPrefs} />
        </div>
      </AccountSection>
    </AccountPageFrame>
  );
}
