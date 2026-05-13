import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { RebookButton } from "@/components/account/rebook-button";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { formatSessionRange } from "@/lib/format-session-time";
import { serverApiJson } from "@/lib/server-api";

type BookingRow = {
  id: string;
  status: string;
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    classType: { name: string };
  };
};

type WaitlistRow = {
  id: string;
  position: number;
  status: string;
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
  };
};

export default async function UserBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [res, waitlistRes] = await Promise.all([
    serverApiJson<BookingRow[]>("/bookings/me", cookie),
    serverApiJson<WaitlistRow[]>("/waitlist/me", cookie),
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
    <AccountPageFrame title={t("title")}>
      <section className="max-w-4xl">
        <h2 className="ommm-h3 text-sage-800">{t("upcoming")}</h2>
        <BookingTable
          locale={locale}
          rows={upcoming}
          showCancel
          emptyLabel={t("emptySection")}
        />
      </section>

      <section className="mt-10 max-w-4xl">
        <h2 className="ommm-h3 text-sage-800">{t("pastOther")}</h2>
        <BookingTable
          locale={locale}
          rows={past}
          showCancel={false}
          showRebook
          emptyLabel={t("emptySection")}
        />
      </section>
      <section className="mt-10 max-w-4xl">
        <h2 className="ommm-h3 text-sage-800">{t("waitlists")}</h2>
        {!waitlistRes.ok ? (
          <p className="ommm-body-muted mt-2 text-sm">{t("waitlistsLoadError")}</p>
        ) : waitlistRes.data.length === 0 ? (
          <p className="ommm-body-muted mt-2 text-sm">{t("waitlistsEmpty")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {waitlistRes.data.map((w) => (
              <li key={w.id} className="ommm-list-row">
                <div>
                  <p className="font-medium text-sage-800">{w.session.classType.name}</p>
                  <p className="text-sm text-sage-500">
                    {formatSessionRange(locale, w.session.startsAt, w.session.endsAt)}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-sage-500/90">
                    {t("waitlistBadge", { pos: w.position, status: w.status })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AccountPageFrame>
  );
}

function BookingTable({
  locale,
  rows,
  showCancel,
  showRebook = false,
  emptyLabel,
}: {
  locale: string;
  rows: BookingRow[];
  showCancel: boolean;
  showRebook?: boolean;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="ommm-body-muted mt-2 text-sm">{emptyLabel}</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {rows.map((b) => (
        <li key={b.id} className="ommm-list-row">
          <div>
            <p className="font-medium text-sage-800">
              {b.session.classType.name}
            </p>
            <p className="text-sm text-sage-500">
              {formatSessionRange(
                locale,
                b.session.startsAt,
                b.session.endsAt,
              )}
            </p>
            <p className="text-xs uppercase tracking-wide text-sage-500/90">
              {b.status}
            </p>
          </div>
          {showCancel && b.status === "BOOKED" ? <CancelBookingButton bookingId={b.id} /> : null}
          {showRebook ? <RebookButton sessionId={b.session.id} /> : null}
        </li>
      ))}
    </ul>
  );
}
