import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
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

export default async function UserClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("userPages.classes");
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

  return (
    <AccountPageFrame
      title={t("title")}
      description={t("description", { days: ACCOUNT_SESSION_RANGE_DAYS })}
    >
      <ul className="max-w-4xl space-y-4">
        {sessions.length === 0 ? (
          <li className="ommm-body-muted text-sm">{t("noSessions")}</li>
        ) : (
          sessions.map((s) => {
            const booked = s._count.bookings;
            const full = booked >= s.capacity;
            const coachName = s.coach.user.name ?? t("coachFallback");
            const spots = t("spotsBooked", {
              booked,
              capacity: s.capacity,
            });
            const pricing =
              s.priceCents > 0
                ? t("paidShort", {
                    amount: (s.priceCents / 100).toFixed(0),
                  })
                : t("includedShort");
            return (
              <li key={s.id} className="ommm-list-row">
                <div>
                  <p className="font-medium text-sage-800">{s.classType.name}</p>
                  <p className="text-sm text-sage-500">
                    {formatSessionRange(locale, s.startsAt, s.endsAt)}
                  </p>
                  <p className="mt-1 text-xs text-sage-500/90">
                    {coachName} · {spots} · {pricing}
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
      <p className="ommm-body-muted mt-8 max-w-4xl text-sm">
        <Link href="/user/bookings" className="ommm-link-sage">
          {t("myBookingsLink")}
        </Link>
      </p>
    </AccountPageFrame>
  );
}
