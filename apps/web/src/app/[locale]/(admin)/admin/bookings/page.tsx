import { headers } from "next/headers";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type BookingAdminRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    startsAt: string;
    classType: { name: string };
  };
};

export default async function AdminBookingsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const to = new Date();
  to.setDate(to.getDate() + 30);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const res = await serverApiJson<BookingAdminRow[]>(
    `/bookings/admin?${q}`,
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? "Coach, manager, or admin sign-in required."
          : `Could not load bookings (${res.status}).`}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Bookings"
      description="Rolling window from API (coach sees roster via coach panel filters)."
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>Member</th>
              <th className={adminChrome.th}>Class</th>
              <th className={adminChrome.th}>Starts</th>
              <th className={adminChrome.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((b) => (
              <tr key={b.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>
                  <span className="font-medium">
                    {b.user.name ?? b.user.email}
                  </span>
                  <br />
                  <span className={adminChrome.metaText}>{b.user.email}</span>
                </td>
                <td className={adminChrome.td}>
                  {b.session.classType.name}
                </td>
                <td className={adminChrome.td}>
                  {new Date(b.session.startsAt).toLocaleString()}
                </td>
                <td className={adminChrome.td}>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
