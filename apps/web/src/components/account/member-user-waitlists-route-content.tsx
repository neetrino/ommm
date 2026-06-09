import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserWaitlistsSection } from "@/components/account/user-waitlists-section";
import { serverApiJson } from "@/lib/server-api";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

type MemberUserWaitlistsRouteContentProps = {
  locale: string;
  embeddedInSheet?: boolean;
};

export async function MemberUserWaitlistsRouteContent({
  locale,
  embeddedInSheet = false,
}: MemberUserWaitlistsRouteContentProps) {
  const t = await getTranslations({ locale, namespace: "userPages.waitlists" });
  const cookie = (await headers()).get("cookie") ?? "";
  const waitlistRes = await serverApiJson<UserWaitlistRow[]>("/waitlist/me", cookie);

  if (!waitlistRes.ok) {
    return (
      <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
        {waitlistRes.status === 401 ? t("signInRequired") : t("loadError")}
      </section>
    );
  }

  return (
    <UserWaitlistsSection
      locale={locale}
      rows={waitlistRes.data}
      loadError={false}
      embeddedInSheet={embeddedInSheet}
    />
  );
}
