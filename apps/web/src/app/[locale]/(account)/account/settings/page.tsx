import { headers } from "next/headers";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Sign in to manage settings.
      </div>
    );
  }

  const { user, notificationPrefs } = res.data;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Profile changes can be wired to PATCH /users/me in a follow-up; email
          is read-only here.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Profile</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-medium text-zinc-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Name</dt>
            <dd className="text-zinc-900">{user.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Phone</dt>
            <dd className="text-zinc-900">{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Locale</dt>
            <dd className="text-zinc-900">{user.locale}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Notifications</h2>
        <div className="mt-4 max-w-md">
          <NotificationPrefsForm initial={notificationPrefs} />
        </div>
      </section>
    </div>
  );
}
