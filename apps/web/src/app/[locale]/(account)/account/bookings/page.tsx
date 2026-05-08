import { headers } from "next/headers";
import { CancelBookingButton } from "@/components/account/cancel-booking-button";
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

export default async function AccountBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await serverApiJson<BookingRow[]>("/bookings/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">
          {res.status === 401
            ? "Sign in to see your bookings."
            : `Could not load bookings (${res.status}).`}
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
    <AccountPageFrame title="My bookings">
      <section className="max-w-4xl">
        <h2 className="ommm-h3 text-sage-800">Upcoming</h2>
        <BookingTable
          locale={locale}
          rows={upcoming}
          showCancel
        />
      </section>

      <section className="mt-10 max-w-4xl">
        <h2 className="ommm-h3 text-sage-800">Past &amp; other</h2>
        <BookingTable locale={locale} rows={past} showCancel={false} />
      </section>
    </AccountPageFrame>
  );
}

function BookingTable({
  locale,
  rows,
  showCancel,
}: {
  locale: string;
  rows: BookingRow[];
  showCancel: boolean;
}) {
  if (rows.length === 0) {
    return <p className="ommm-body-muted mt-2 text-sm">Nothing here yet.</p>;
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
          {showCancel && b.status === "BOOKED" ? (
            <CancelBookingButton bookingId={b.id} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
