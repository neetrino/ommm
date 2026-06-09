import { serverApiJson } from "@/lib/server-api";
import { isUserDashboardRole } from "@/lib/role-home";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { getCachedUsersMe } from "@/server/cached-users-me";

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
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    role: string;
    homeImageUrl?: string | null;
  };
  coachProfileId: string | null;
  achievements: { title: string; unlockedAt: string }[];
  nextBooking: MemberUserHomeNextBooking | null;
  waitlistOk: boolean;
  waitlistRows: WaitRow[];
};

export type MemberUserHomePageOutcome =
  | { kind: "ok"; data: MemberUserHomePageData }
  | { kind: "unauthorized" };

/** Shared bookings/waitlist payload for member home (`/user`). */
export async function loadMemberUserHomePageData(
  locale: string,
): Promise<MemberUserHomePageOutcome> {
  const me = await getCachedUsersMe();

  if (!me.ok) {
    return { kind: "unauthorized" };
  }

  if (!isUserDashboardRole(me.data.user.role)) {
    redirectToRoleHome(locale, me.data.user.role);
  }

  const [bookingsRes, waitRes] = await Promise.all([
    serverApiJson<BookingRow[]>("/bookings/me", me.cookie),
    serverApiJson<WaitRow[]>("/waitlist/me", me.cookie),
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

  const achievements = me.data.achievements ?? [];

  return {
    kind: "ok",
    data: {
      user: {
        name: me.data.user.name ?? null,
        lastName: me.data.user.lastName ?? null,
        email: me.data.user.email ?? "",
        role: me.data.user.role,
        homeImageUrl: me.data.user.homeImageUrl ?? null,
      },
      coachProfileId: me.data.coachProfileId,
      achievements: achievements.slice(0, 6),
      nextBooking,
      waitlistOk: waitRes.ok,
      waitlistRows: waitRes.ok ? waitRes.data : [],
    },
  };
}
