import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { formatSessionRange } from "@/lib/format-session-time";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: { name: string | null; email: string; role: string };
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
  };
};

type WaitRow = {
  id: string;
  status: string;
  session: {
    startsAt: string;
    classType: { name: string };
  };
};

export default async function AccountHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("common");
  const cookie = (await headers()).get("cookie") ?? "";

  const [meRes, bookingsRes, waitRes] = await Promise.all([
    serverApiJson<MeResponse>("/users/me", cookie),
    serverApiJson<BookingRow[]>("/bookings/me", cookie),
    serverApiJson<WaitRow[]>("/waitlist/me", cookie),
  ]);

  if (!meRes.ok) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-medium text-amber-900">Sign in required</p>
        <p className="mt-2 text-sm text-amber-800">
          {meRes.status === 401
            ? "Use Log in to access your member dashboard."
            : meRes.body}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-amber-900 underline"
        >
          {t("login")}
        </Link>
      </div>
    );
  }

  const now = Date.now();
  const upcoming = (bookingsRes.ok ? bookingsRes.data : [])
    .filter(
      (b) =>
        b.status === "BOOKED" && new Date(b.session.startsAt).getTime() > now,
    )
    .slice(0, 5);

  const achievements = meRes.data.achievements.slice(0, 6);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {meRes.data.user.name?.trim() || meRes.data.user.email}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{t("account")}</p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Upcoming bookings</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">
            No upcoming classes.{" "}
            <Link href="/account/classes" className="font-medium underline">
              Browse schedule
            </Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-medium text-zinc-900">
                  {b.session.classType.name}
                </p>
                <p className="text-zinc-600">
                  {formatSessionRange(
                    locale,
                    b.session.startsAt,
                    b.session.endsAt,
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Waitlist</h2>
        {!waitRes.ok ? (
          <p className="mt-2 text-sm text-zinc-600">Could not load waitlist.</p>
        ) : waitRes.data.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">You are not on a waitlist.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {waitRes.data.map((w) => (
              <li
                key={w.id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-medium text-zinc-900">
                  {w.session.classType.name}
                </p>
                <p className="text-zinc-500">
                  {w.status} ·{" "}
                  {new Date(w.session.startsAt).toLocaleString(locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Achievements</h2>
        {achievements.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">
            Keep booking classes to unlock milestones.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => (
              <li
                key={`${a.title}-${a.unlockedAt}`}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-medium text-zinc-900">{a.title}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(a.unlockedAt).toLocaleDateString(locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Explore</h2>
        <p className="mt-2 text-sm text-zinc-600">
          News and studio updates on the public site.
        </p>
        <Link
          href="/explore"
          className="mt-3 inline-block text-sm font-medium text-zinc-900 underline"
        >
          Open Explore
        </Link>
      </section>

      {meRes.data.coachProfileId ? (
        <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <h2 className="text-lg font-medium text-indigo-950">Coach panel</h2>
          <Link
            href="/coach"
            className="mt-2 inline-block text-sm font-medium text-indigo-900 underline"
          >
            Open schedule &amp; roster tools
          </Link>
        </section>
      ) : null}
    </div>
  );
}
