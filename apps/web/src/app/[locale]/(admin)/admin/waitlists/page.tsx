import { headers } from "next/headers";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type WaitlistAdminRow = {
  id: string;
  position: number;
  status: string;
  offeredAt: string | null;
  offerExpiresAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  session: { id: string; startsAt: string; classType: { name: string } };
};

export default async function AdminWaitlistsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<WaitlistAdminRow[]>(
    "/waitlist/admin/recent?take=200",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? "Admin or manager sign-in required."
          : `Could not load waitlists (${res.status}).`}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Waitlists"
      description={
        <>
          Recent waitlist entries (all statuses). Per-session roster uses{" "}
          <code className={adminChrome.inlineCode}>
            GET /v1/waitlist/sessions/:sessionId
          </code>
          .
        </>
      }
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>User</th>
              <th className={adminChrome.th}>Class</th>
              <th className={adminChrome.th}>Session</th>
              <th className={adminChrome.th}>Pos</th>
              <th className={adminChrome.th}>Status</th>
              <th className={adminChrome.th}>Offer expires</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((w) => (
              <tr key={w.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>
                  <div className="font-medium">{w.user.name ?? "—"}</div>
                  <div className={adminChrome.metaText}>{w.user.email}</div>
                </td>
                <td className={adminChrome.td}>
                  {w.session.classType.name}
                </td>
                <td className={adminChrome.td}>
                  {new Date(w.session.startsAt).toLocaleString()}
                </td>
                <td className={adminChrome.td}>{w.position}</td>
                <td className={adminChrome.td}>{w.status}</td>
                <td className={adminChrome.td}>
                  {w.offerExpiresAt
                    ? new Date(w.offerExpiresAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
