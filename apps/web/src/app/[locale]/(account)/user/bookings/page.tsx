import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserBookingsSection } from "@/components/account/user-bookings-section";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { serverApiJson } from "@/lib/server-api";
import type { UserBookingRow, UserWaitlistRow } from "@/lib/user-booking-types";

export default async function UserBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [res, waitlistRes] = await Promise.all([
    serverApiJson<UserBookingRow[]>("/bookings/me", cookie),
    serverApiJson<UserWaitlistRow[]>("/waitlist/me", cookie),
  ]);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">
          {res.status === 401
            ? t("signInRequired")
            : t("loadError", { status: res.status })}
        </div>
      </div>
    );
  }

  const upcoming = res.data.filter(
    (b) =>
      b.status === "BOOKED" && new Date(b.session.startsAt) > new Date(),
  );
  const past = res.data.filter(
    (b) =>
      b.status !== "BOOKED" || new Date(b.session.startsAt) <= new Date(),
  );

  return (
    <MemberContentFrame>
      <UserBookingsSection
        locale={locale}
        upcoming={upcoming}
        past={past}
        waitlist={waitlistRes.ok ? waitlistRes.data : []}
        waitlistLoadError={!waitlistRes.ok}
      />
    </MemberContentFrame>
  );
}
