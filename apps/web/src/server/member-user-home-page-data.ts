import { headers } from "next/headers";
import { isUserDashboardRole } from "@/lib/role-home";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    role: string;
    homeImageUrl?: string | null;
  };
  coachProfileId: string | null;
  achievements: { title: string; unlockedAt: string }[];
};

type BookingRow = {
  id: string;
  status: string;
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
    coach: { user: { name: string | null } };
  };
};

type WaitRow = {
  id: string;
  status: string;
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
    coach: { user: { name: string | null } };
  };
};

export type MemberUserHomeNextBooking = {
  id: string;
  className: string;
  startsAt: string;
  endsAt: string;
  coachName: string | null;
};

export type MemberUserHomePageData = {
  user: MeResponse["user"];
  coachProfileId: string | null;
  achievements: MeResponse["achievements"];
  nextBooking: MemberUserHomeNextBooking | null;
  waitlistOk: boolean;
  waitlistRows: WaitRow[];
};

export type MemberUserHomePageOutcome =
  | { kind: "ok"; data: MemberUserHomePageData }
  | { kind: "unauthorized" };

/** Shared `/users/me` + bookings/waitlist payload for member home (`/user`). */
export async function loadMemberUserHomePageData(
  locale: string,
): Promise<MemberUserHomePageOutcome> {
  const cookie = (await headers()).get("cookie") ?? "";
  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!meRes.ok) {
    return { kind: "unauthorized" };
  }

  if (!isUserDashboardRole(meRes.data.user.role)) {
    redirectToRoleHome(locale, meRes.data.user.role);
  }

  const [bookingsRes, waitRes] = await Promise.all([
    serverApiJson<BookingRow[]>("/bookings/me", cookie),
    serverApiJson<WaitRow[]>("/waitlist/me", cookie),
  ]);

  const asOf = new Date();
  const upcoming = (bookingsRes.ok ? bookingsRes.data : []).filter(
    (booking) =>
      booking.status === "BOOKED" && new Date(booking.session.startsAt) > asOf,
  );
  const first = upcoming[0];
  const nextBooking = first
    ? {
        id: first.id,
        className: first.session.classType.name,
        startsAt: first.session.startsAt,
        endsAt: first.session.endsAt,
        coachName: (() => {
          const trimmed = first.session.coach.user.name?.trim();
          return trimmed && trimmed.length > 0 ? trimmed : null;
        })(),
      }
    : null;

  return {
    kind: "ok",
    data: {
      user: meRes.data.user,
      coachProfileId: meRes.data.coachProfileId,
      achievements: meRes.data.achievements.slice(0, 6),
      nextBooking,
      waitlistOk: waitRes.ok,
      waitlistRows: waitRes.ok ? waitRes.data : [],
    },
  };
}
