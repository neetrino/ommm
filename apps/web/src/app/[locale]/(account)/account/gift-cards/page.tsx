import { headers } from "next/headers";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import { serverApiJson } from "@/lib/server-api";

type GiftRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: string;
  recipientEmail: string | null;
  recipientName: string | null;
};

export default async function AccountGiftCardsPage() {
  const cookie = (await headers()).get("cookie") ?? "";

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<GiftRow[]>("/gift-cards/me/purchased", cookie),
    serverApiJson<GiftRow[]>("/gift-cards/me/received", cookie),
    serverApiJson<{ user: { giftCreditsCents: number } }>("/users/me", cookie),
  ]);

  const credits = meRes.ok ? meRes.data.user.giftCreditsCents : null;

  return (
    <div className="space-y-10 pt-6 sm:pt-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Gift cards</h1>
        {credits != null ? (
          <p className="mt-2 text-sm text-zinc-600">
            Gift balance (credits):{" "}
            <span className="font-medium tabular-nums">{credits}</span> cents
          </p>
        ) : null}
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Redeem</h2>
        <div className="mt-4 max-w-sm">
          <GiftRedeemForm />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">Purchase</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Opens Stripe Checkout (configure{" "}
          <code className="text-xs">STRIPE_SECRET_KEY</code>).
        </p>
        <div className="mt-4 max-w-sm">
          <GiftPurchaseForm />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Purchased</h2>
        {!purchasedRes.ok ? (
          <p className="mt-2 text-sm text-zinc-600">Sign in to view.</p>
        ) : purchasedRes.data.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No gift cards purchased.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {purchasedRes.data.map((g) => (
              <li
                key={g.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
              >
                <span className="font-mono">{g.code}</span> · balance{" "}
                {g.balanceCents}/{g.amountCents} · {g.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Received</h2>
        {!receivedRes.ok ? (
          <p className="mt-2 text-sm text-zinc-600">Sign in to view.</p>
        ) : receivedRes.data.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No gifts received yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {receivedRes.data.map((g) => (
              <li
                key={g.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
              >
                {g.recipientName ?? "Gift"} · balance {g.balanceCents} ·{" "}
                {g.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
