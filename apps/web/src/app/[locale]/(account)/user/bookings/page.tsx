import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserBookingsSection } from "@/components/account/user-bookings-section";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import {
  buildUserBookingsPastEndpoint,
  buildUserBookingsUpcomingEndpoint,
  USER_BOOKINGS_PAST_PAGE_KEYS,
  type UserBookingsPastPayload,
} from "@/lib/user-bookings-query";
import { parseListPageParams } from "@/lib/list-pagination";
import { readUserListOrderFromSearch } from "@/lib/user-list-order-url";
import { serverApiJson } from "@/lib/server-api";
import type { UserBookingRow } from "@/lib/user-booking-types";

export default async function UserBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "userPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search, USER_BOOKINGS_PAST_PAGE_KEYS);
  const order = readUserListOrderFromSearch(search, "session", "upcoming");
  const pastEndpoint = buildUserBookingsPastEndpoint(listPage.take, listPage.offset, order);
  const upcomingEndpoint = buildUserBookingsUpcomingEndpoint(order);

  const [upcomingRes, pastRes] = await Promise.all([
    serverApiJson<UserBookingRow[]>(upcomingEndpoint, cookie),
    serverApiJson<UserBookingsPastPayload>(pastEndpoint, cookie),
  ]);

  if (!upcomingRes.ok || !pastRes.ok) {
    const failed = [upcomingRes, pastRes].find((res) => !res.ok);
    const status = failed && !failed.ok ? failed.status : 500;
    return (
      <div className="ommm-container">
        <div className="app-alert-warn">
          {status === 401 ? t("signInRequired") : t("loadError", { status })}
        </div>
      </div>
    );
  }

  return (
    <MemberContentFrame>
      <UserBookingsSection
        locale={locale}
        initialUpcoming={upcomingRes.data}
        initialPast={pastRes.data}
      />
    </MemberContentFrame>
  );
}
