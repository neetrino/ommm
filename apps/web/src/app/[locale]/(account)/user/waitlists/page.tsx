import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserWaitlistsSection } from "@/components/account/user-waitlists-section";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { serverApiJson } from "@/lib/server-api";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

export default async function UserWaitlistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.waitlists" });
  const cookie = (await headers()).get("cookie") ?? "";
  const waitlistRes = await serverApiJson<UserWaitlistRow[]>("/waitlist/me", cookie);

  if (!waitlistRes.ok) {
    return (
      <MemberContentFrame description={t("description")}>
        <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
          {waitlistRes.status === 401 ? t("signInRequired") : t("loadError")}
        </section>
      </MemberContentFrame>
    );
  }

  return (
    <MemberContentFrame description={t("description")}>
      <UserWaitlistsSection locale={locale} rows={waitlistRes.data} loadError={false} />
    </MemberContentFrame>
  );
}
