import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { formatSessionRange } from "@/lib/format-session-time";
import { serverApiJson } from "@/lib/server-api";

type ScheduleSessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: string;
  priceCents: number;
  classType: { name: string; slug: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};

export async function MarketingScheduleLiveView({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "marketingPages.scheduleLive" });
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + 14);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
  const sessionsRes = await serverApiJson<ScheduleSessionRow[]>(
    `/classes/sessions?${q}`,
    cookie,
  );

  if (!sessionsRes.ok) {
    return <p className="app-alert-warn mt-6">{t("loadFailed", { status: sessionsRes.status })}</p>;
  }

  const sessions = sessionsRes.data
    .filter((s) => new Date(s.startsAt) > new Date())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div className="ommm-card p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-[clamp(1.6rem,1.8vw+1rem,2.2rem)] italic font-semibold tracking-tight text-sage-900">
          {t("title")}
        </h1>
        <div className="flex gap-2">
          <Link href="/login" className="ommm-cta-ghost text-sm">
            {t("login")}
          </Link>
          <Link href="/register" className="ommm-cta-primary text-sm">
            {t("register")}
          </Link>
        </div>
      </div>
      {sessions.length === 0 ? (
        <p className="mt-6 text-sm text-sage-600">{t("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {sessions.map((s) => {
            const booked = s._count.bookings;
            const full = booked >= s.capacity;
            return (
              <li key={s.id} className="ommm-list-row">
                <div>
                  <p className="font-medium text-sage-900">{s.classType.name}</p>
                  <p className="text-sm text-sage-600">
                    {formatSessionRange(locale, s.startsAt, s.endsAt)}
                  </p>
                  <p className="mt-1 text-xs text-sage-500">
                    {(s.coach.user.name ?? t("coach")) +
                      " · " +
                      t("capacity", { booked, capacity: s.capacity })}
                  </p>
                </div>
                <div className="shrink-0">
                  {full ? (
                    <JoinWaitlistButton sessionId={s.id} />
                  ) : (
                    <BookSessionButton sessionId={s.id} priceCents={s.priceCents} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
