import { headers } from "next/headers";
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Admin or manager sign-in required."
          : `Could not load gift cards (${res.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Gift cards</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Issued cards from <code className="text-xs">GET /v1/gift-cards/admin</code>
        . Resend and deactivate actions are available via API for admins.
      </p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Purchaser</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((g) => (
              <tr key={g.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-mono text-xs text-zinc-900">
                  {g.code}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {g.purchaser.name ?? g.purchaser.email}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {g.recipientName ?? g.recipient?.name ?? g.recipientEmail ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {(g.balanceCents / 100).toFixed(2)} /{" "}
                  {(g.amountCents / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-zinc-600">{g.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
