import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { formatSessionRange } from "@/lib/format-session-time";
import { serverApiJson } from "@/lib/server-api";

type SessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  priceCents: number;
  status: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};

export default async function AccountClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookie = (await headers()).get("cookie") ?? "";

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const sessionsRes = await serverApiJson<SessionRow[]>(
    `/classes/sessions?${q}`,
    cookie,
  );

  if (!sessionsRes.ok) {
    return (
      <div className="pt-6 sm:pt-8">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Could not load schedule ({sessionsRes.status}).
      </div>
      </div>
    );
  }

  const sessions = sessionsRes.data.filter(
    (s) => s.startsAt && new Date(s.startsAt) > new Date(),
  );

  return (
    <div className="pt-6 sm:pt-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Classes</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Next {ACCOUNT_SESSION_RANGE_DAYS} days · book or join the waitlist when
        full.
      </p>
      <ul className="mt-6 space-y-4">
        {sessions.length === 0 ? (
          <li className="text-sm text-zinc-600">No sessions in this window.</li>
        ) : (
          sessions.map((s) => {
            const booked = s._count.bookings;
            const full = booked >= s.capacity;
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {s.classType.name}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {formatSessionRange(locale, s.startsAt, s.endsAt)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {s.coach.user.name ?? "Coach"} · {booked}/{s.capacity}{" "}
                    booked ·{" "}
                    {s.priceCents > 0
                      ? `Paid (${(s.priceCents / 100).toFixed(0)}+)`
                      : "Included / membership"}
                  </p>
                </div>
                <div className="shrink-0">
                  {full ? (
                    <JoinWaitlistButton sessionId={s.id} />
                  ) : (
                    <BookSessionButton
                      sessionId={s.id}
                      priceCents={s.priceCents}
                    />
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
      <p className="mt-8 text-sm text-zinc-600">
        <Link href="/account/bookings" className="underline">
          My bookings
        </Link>
      </p>
    </div>
  );
}
