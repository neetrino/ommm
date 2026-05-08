import { headers } from "next/headers";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: {
    email: string;
    name: string | null;
    phone: string | null;
    locale: string;
  };
  notificationPrefs: {
    bookingReminders: boolean;
    waitlistAlerts: boolean;
    promotions: boolean;
    communityUpdates: boolean;
  };
};

export default async function AccountSettingsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">Sign in to manage settings.</div>
      </div>
    );
  }

  const { user, notificationPrefs } = res.data;

  return (
    <AccountPageFrame
      title="Settings"
      description="Profile changes can be wired to PATCH /users/me in a follow-up; email is read-only here."
    >
      <div className="max-w-4xl space-y-10">
        <AccountSection title="Profile">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-sage-500">Email</dt>
              <dd className="font-medium text-sage-800">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sage-500">Name</dt>
              <dd className="text-sage-700">{user.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sage-500">Phone</dt>
              <dd className="text-sage-700">{user.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sage-500">Locale</dt>
              <dd className="text-sage-700">{user.locale}</dd>
            </div>
          </dl>
        </AccountSection>

        <AccountSection title="Notifications">
          <div className="max-w-md">
            <NotificationPrefsForm initial={notificationPrefs} />
          </div>
        </AccountSection>
      </div>
    </AccountPageFrame>
  );
}
