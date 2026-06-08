import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { MemberDashboard } from "@/components/account/member-dashboard";
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

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tDash = await getTranslations({ locale, namespace: "account.dashboard" });
  const cookie = (await headers()).get("cookie") ?? "";

  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);
  if (!meRes.ok) {
    return (
      <div className="ommm-admin-content">
        <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/90 p-8 text-amber-950 backdrop-blur-md">
          <p className="font-serif text-lg font-semibold">{tDash("signIn.title")}</p>
          <p className="mt-2 text-sm text-amber-900/90">{tDash("signIn.body")}</p>
          <Link href="/login" className="ommm-admin-add-button mt-6 inline-flex">
            {tCommon("login")}
          </Link>
        </div>
      </div>
    );
  }

  if (!isUserDashboardRole(meRes.data.user.role)) {
    redirectToRoleHome(locale, meRes.data.user.role);
  }

  const [bookingsRes, waitRes] = await Promise.all([
    serverApiJson<BookingRow[]>("/bookings/me", cookie),
    serverApiJson<WaitRow[]>("/waitlist/me", cookie),
  ]);

  const asOf = new Date();
  const upcoming = (bookingsRes.ok ? bookingsRes.data : [])
    .filter(
      (b: BookingRow) =>
        b.status === "BOOKED" && new Date(b.session.startsAt) > asOf,
    )
    .slice(0, 5);

  const achievements = meRes.data.achievements.slice(0, 6);
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

  return (
    <MemberDashboard
      locale={locale}
      name={meRes.data.user.name}
      lastName={meRes.data.user.lastName}
      email={meRes.data.user.email}
      nextBooking={nextBooking}
      waitlistOk={waitRes.ok}
      waitlistRows={waitRes.ok ? waitRes.data : []}
      achievements={achievements}
      coachProfileId={meRes.data.coachProfileId}
    />
  );
}
