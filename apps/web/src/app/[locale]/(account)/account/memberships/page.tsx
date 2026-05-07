import { headers } from "next/headers";
import { MembershipCheckoutButton } from "@/components/account/membership-checkout-button";
import { serverApiJson } from "@/lib/server-api";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
  periodDays: number;
  isActive: boolean;
};

type MembershipRow = {
  id: string;
  status: string;
  sessionsRemaining: number | null;
  currentPeriodEnd: string;
  plan: { name: string };
};

type PaymentRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
};

export default async function AccountMembershipsPage() {
  const cookie = (await headers()).get("cookie") ?? "";

  const [plansRes, mineRes, payRes] = await Promise.all([
    serverApiJson<Plan[]>("/memberships/plans", cookie),
    serverApiJson<MembershipRow[]>("/memberships/me", cookie),
    serverApiJson<PaymentRow[]>("/payments/me", cookie),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Memberships</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Subscribe with Stripe when keys are configured; pause or cancel from the
        API or future admin tools.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-900">Your memberships</h2>
        {!mineRes.ok ? (
          <p className="mt-2 text-sm text-amber-800">Sign in to view.</p>
        ) : mineRes.data.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No active membership yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {mineRes.data.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <p className="font-medium text-zinc-900">{m.plan.name}</p>
                <p className="text-zinc-600">
                  {m.status}
                  {m.sessionsRemaining != null
                    ? ` · ${m.sessionsRemaining} sessions left`
                    : ""}
                </p>
                <p className="text-xs text-zinc-500">
                  Renews / ends {new Date(m.currentPeriodEnd).toDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">Payment history</h2>
        {!payRes.ok ? (
          <p className="mt-2 text-sm text-zinc-600">Sign in to view payments.</p>
        ) : payRes.data.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No payments recorded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {payRes.data.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              >
                <span className="font-medium tabular-nums text-zinc-900">
                  {(p.amountCents / 100).toFixed(2)} {p.currency.toUpperCase()}
                </span>
                <span className="ml-2 text-zinc-600">{p.status}</span>
                {p.description ? (
                  <span className="ml-2 text-zinc-500">{p.description}</span>
                ) : null}
                <span className="ml-2 text-xs text-zinc-400">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">Plans</h2>
        {!plansRes.ok ? (
          <p className="mt-2 text-sm text-amber-800">Could not load plans.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {plansRes.data
              .filter((p) => p.isActive)
              .map((plan) => (
                <li
                  key={plan.id}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <p className="font-semibold text-zinc-900">{plan.name}</p>
                  {plan.description ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      {plan.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm text-zinc-700">
                    {(plan.priceCents / 100).toFixed(0)} per {plan.periodDays}-day
                    period ·{" "}
                    {plan.isUnlimited
                      ? "Unlimited classes"
                      : `${plan.sessionsPerMonth ?? 0} sessions / period`}
                  </p>
                  {mineRes.ok ? (
                    <div className="mt-4">
                      <MembershipCheckoutButton planId={plan.id} />
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-zinc-500">
                      Log in to subscribe.
                    </p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
