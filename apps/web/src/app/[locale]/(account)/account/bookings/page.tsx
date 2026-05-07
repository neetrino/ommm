import { headers } from "next/headers";
import { CancelBookingButton } from "@/components/account/cancel-booking-button";
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401
          ? "Sign in to see your bookings."
          : `Could not load bookings (${res.status}).`}
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
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">My bookings</h1>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-900">Upcoming</h2>
        <BookingTable
          locale={locale}
          rows={upcoming}
          showCancel
        />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">Past &amp; other</h2>
        <BookingTable locale={locale} rows={past} showCancel={false} />
      </section>
    </div>
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
    return <p className="mt-2 text-sm text-zinc-600">Nothing here yet.</p>;
  }
  return (
    <ul className="mt-3 space-y-3">
      {rows.map((b) => (
        <li
          key={b.id}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium text-zinc-900">
              {b.session.classType.name}
            </p>
            <p className="text-sm text-zinc-600">
              {formatSessionRange(
                locale,
                b.session.startsAt,
                b.session.endsAt,
              )}
            </p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
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
