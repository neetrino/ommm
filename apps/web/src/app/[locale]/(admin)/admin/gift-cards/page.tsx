import { headers } from "next/headers";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type GiftRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: string;
  recipientEmail: string | null;
  recipientName: string | null;
  expiresAt: string | null;
  createdAt: string;
  purchaser: { email: string; name: string | null };
  recipient: { email: string; name: string | null } | null;
};

export default async function AdminGiftCardsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<GiftRow[]>("/gift-cards/admin", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? "Admin or manager sign-in required."
          : `Could not load gift cards (${res.status}).`}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Gift cards"
      description={
        <>
          Issued cards from{" "}
          <code className={adminChrome.inlineCode}>GET /v1/gift-cards/admin</code>
          . Resend and deactivate actions are available via API for admins.
        </>
      }
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>Code</th>
              <th className={adminChrome.th}>Purchaser</th>
              <th className={adminChrome.th}>Recipient</th>
              <th className={adminChrome.th}>Balance</th>
              <th className={adminChrome.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((g) => (
              <tr key={g.id} className={adminChrome.tr}>
                <td className={adminChrome.tdMono}>{g.code}</td>
                <td className={adminChrome.td}>
                  {g.purchaser.name ?? g.purchaser.email}
                </td>
                <td className={adminChrome.td}>
                  {g.recipientName ?? g.recipient?.name ?? g.recipientEmail ?? "—"}
                </td>
                <td className={adminChrome.td}>
                  {(g.balanceCents / 100).toFixed(2)} /{" "}
                  {(g.amountCents / 100).toFixed(2)}
                </td>
                <td className={adminChrome.td}>{g.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
