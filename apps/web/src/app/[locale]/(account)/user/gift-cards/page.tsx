import { headers } from "next/headers";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
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

export default async function UserGiftCardsPage() {
  const cookie = (await headers()).get("cookie") ?? "";

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<GiftRow[]>("/gift-cards/me/purchased", cookie),
    serverApiJson<GiftRow[]>("/gift-cards/me/received", cookie),
    serverApiJson<{ user: { giftCreditsCents: number } }>("/users/me", cookie),
  ]);

  const credits = meRes.ok ? meRes.data.user.giftCreditsCents : null;

  return (
    <AccountPageFrame
      title="Gift cards"
      description={
        credits != null
          ? `Gift balance (credits): ${credits} cents`
          : undefined
      }
    >
      <div className="max-w-4xl space-y-10">
        <AccountSection title="Redeem">
          <div className="max-w-sm">
            <GiftRedeemForm />
          </div>
        </AccountSection>

        <AccountSection title="Purchase">
          <p className="ommm-body-muted text-sm">
            Opens Stripe Checkout (configure{" "}
            <code className="rounded-lg bg-white/50 px-1.5 py-0.5 text-xs text-sage-700">
              STRIPE_SECRET_KEY
            </code>
            ).
          </p>
          <div className="mt-4 max-w-sm">
            <GiftPurchaseForm />
          </div>
        </AccountSection>

        <section>
          <h2 className="ommm-h3 text-sage-800">Purchased</h2>
          {!purchasedRes.ok ? (
            <p className="ommm-body-muted mt-2 text-sm">Sign in to view.</p>
          ) : purchasedRes.data.length === 0 ? (
            <p className="ommm-body-muted mt-2 text-sm">
              No gift cards purchased.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {purchasedRes.data.map((g) => (
                <li key={g.id} className="ommm-inset-row font-mono text-sage-700">
                  {g.code} · balance {g.balanceCents}/{g.amountCents} ·{" "}
                  {g.status}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="ommm-h3 text-sage-800">Received</h2>
          {!receivedRes.ok ? (
            <p className="ommm-body-muted mt-2 text-sm">Sign in to view.</p>
          ) : receivedRes.data.length === 0 ? (
            <p className="ommm-body-muted mt-2 text-sm">No gifts received yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {receivedRes.data.map((g) => (
                <li key={g.id} className="ommm-inset-row">
                  {g.recipientName ?? "Gift"} · balance {g.balanceCents} ·{" "}
                  {g.status}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AccountPageFrame>
  );
}
