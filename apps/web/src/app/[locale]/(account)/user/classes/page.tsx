import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserClassesSection } from "@/components/account/user-classes-section";
import { resolveScheduleView } from "@/components/admin/admin-schedule-view";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import type { UserBookingRow, UserSessionRow } from "@/lib/user-booking-types";
import { buildUserSessionBookingMap } from "@/lib/user-session-bookings-map";
import { serverApiJson } from "@/lib/server-api";

export default async function UserClassesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const initialView = resolveScheduleView(search.view);
  const t = await getTranslations({ locale, namespace: "userPages.classes" });
  const cookie = (await headers()).get("cookie") ?? "";

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const [sessionsRes, bookingsRes] = await Promise.all([
    serverApiJson<UserSessionRow[]>(`/classes/sessions?${q}`, cookie),
    serverApiJson<UserBookingRow[]>("/bookings/me", cookie),
  ]);

  if (!sessionsRes.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">
          {t("couldNotLoad", { status: sessionsRes.status })}
        </div>
      </div>
    );
  }

  const sessions = sessionsRes.data.filter(
    (s) => s.startsAt && new Date(s.startsAt) > new Date(),
  );
  const sessionBookings = bookingsRes.ok
    ? buildUserSessionBookingMap(bookingsRes.data)
    : {};

  return (
    <MemberContentFrame>
      <Suspense fallback={null}>
        <UserClassesSection
          locale={locale}
          sessions={sessions}
          sessionBookings={sessionBookings}
          initialView={initialView}
        />
      </Suspense>
    </MemberContentFrame>
  );
}
