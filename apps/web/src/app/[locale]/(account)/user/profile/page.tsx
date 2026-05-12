import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: {
    email: string;
    name: string | null;
    phone: string | null;
    locale: string;
  };
};

export default async function UserProfilePage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">Sign in to view your profile.</div>
      </div>
    );
  }

  const { user } = res.data;

  return (
    <AccountPageFrame
      title="Profile"
      description="Your studio profile. Edit details and preferences in Settings."
    >
      <div className="max-w-xl space-y-4 rounded-[28px] border border-white/70 bg-white/70 p-8 backdrop-blur-md">
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
        <Link href="/user/settings" className="ommm-cta-primary mt-4 inline-flex">
          Open settings
        </Link>
      </div>
    </AccountPageFrame>
  );
}
