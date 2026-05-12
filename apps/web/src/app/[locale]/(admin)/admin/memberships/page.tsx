import { headers } from "next/headers";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type MembershipAdminRow = {
  id: string;
  status: string;
  sessionsRemaining: number | null;
  currentPeriodEnd: string | null;
  plan: { name: string; slug: string };
  user: { id: string; email: string; name: string | null };
};

export default async function AdminMembershipsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MembershipAdminRow[]>(
    "/memberships/admin/all",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? "Studio admin sign-in required for membership billing."
          : `Could not load memberships (${res.status}).`}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Memberships & billing"
      description={
        <>
          Active and historical memberships from{" "}
          <code className={adminChrome.inlineCode}>
            GET /v1/memberships/admin/all
          </code>
          . Plan edits and manual assignment use the API or future forms here.
        </>
      }
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>Member</th>
              <th className={adminChrome.th}>Plan</th>
              <th className={adminChrome.th}>Status</th>
              <th className={adminChrome.th}>Sessions left</th>
              <th className={adminChrome.th}>Period end</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((m) => (
              <tr key={m.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>
                  <div className="font-medium">{m.user.name ?? "—"}</div>
                  <div className={adminChrome.metaText}>{m.user.email}</div>
                </td>
                <td className={adminChrome.td}>{m.plan.name}</td>
                <td className={adminChrome.td}>{m.status}</td>
                <td className={adminChrome.td}>
                  {m.sessionsRemaining ?? "—"}
                </td>
                <td className={adminChrome.td}>
                  {m.currentPeriodEnd
                    ? new Date(m.currentPeriodEnd).toLocaleDateString()
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
