import { headers } from "next/headers";
import { MembershipCheckoutButton } from "@/components/account/membership-checkout-button";
import { MembershipLifecycleButtons } from "@/components/account/membership-lifecycle-buttons";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
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

export default async function UserMembershipsPage() {
  const cookie = (await headers()).get("cookie") ?? "";

  const [plansRes, mineRes, payRes] = await Promise.all([
    serverApiJson<Plan[]>("/memberships/plans", cookie),
    serverApiJson<MembershipRow[]>("/memberships/me", cookie),
    serverApiJson<PaymentRow[]>("/payments/me", cookie),
  ]);

  return (
    <AccountPageFrame
      title="Memberships"
      description="Subscribe with Stripe when keys are configured; pause or cancel from the API or future admin tools."
    >
      <div className="max-w-4xl space-y-10">
        <AccountSection title="Your memberships">
          {!mineRes.ok ? (
            <p className="text-sm text-amber-900">Sign in to view.</p>
          ) : mineRes.data.length === 0 ? (
            <p className="ommm-body-muted text-sm">No active membership yet.</p>
          ) : (
            <ul className="space-y-3">
              {mineRes.data.map((m) => (
                <li key={m.id} className="ommm-stack-card">
                  <p className="font-medium text-sage-800">{m.plan.name}</p>
                  <p className="text-sm text-sage-500">
                    {m.status}
                    {m.sessionsRemaining != null
                      ? ` · ${m.sessionsRemaining} sessions left`
                      : ""}
                  </p>
                  <p className="text-xs text-sage-500/90">
                    Renews / ends {new Date(m.currentPeriodEnd).toDateString()}
                  </p>
                  <MembershipLifecycleButtons
                    membershipId={m.id}
                    status={m.status}
                  />
                </li>
              ))}
            </ul>
          )}
        </AccountSection>

        <AccountSection title="Payment history">
          {!payRes.ok ? (
            <p className="ommm-body-muted text-sm">Sign in to view payments.</p>
          ) : payRes.data.length === 0 ? (
            <p className="ommm-body-muted text-sm">No payments recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {payRes.data.map((p) => (
                <li key={p.id} className="ommm-inset-row">
                  <span className="font-medium tabular-nums text-sage-800">
                    {(p.amountCents / 100).toFixed(2)}{" "}
                    {p.currency.toUpperCase()}
                  </span>
                  <span className="ml-2 text-sage-500">{p.status}</span>
                  {p.description ? (
                    <span className="ml-2 text-sage-500">{p.description}</span>
                  ) : null}
                  <span className="ml-2 text-xs text-sage-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AccountSection>

        <AccountSection title="Plans">
          {!plansRes.ok ? (
            <p className="text-sm text-amber-900">Could not load plans.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {plansRes.data
                .filter((p) => p.isActive)
                .map((plan) => (
                  <li key={plan.id} className="ommm-stack-card">
                    <p className="font-semibold text-sage-800">{plan.name}</p>
                    {plan.description ? (
                      <p className="mt-2 text-sm text-sage-500">
                        {plan.description}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm text-sage-700">
                      {(plan.priceCents / 100).toFixed(0)} per {plan.periodDays}
                      -day period ·{" "}
                      {plan.isUnlimited
                        ? "Unlimited classes"
                        : `${plan.sessionsPerMonth ?? 0} sessions / period`}
                    </p>
                    {mineRes.ok ? (
                      <div className="mt-4">
                        <MembershipCheckoutButton planId={plan.id} />
                      </div>
                    ) : (
                      <p className="ommm-body-muted mt-4 text-xs">
                        Log in to subscribe.
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </AccountSection>
      </div>
    </AccountPageFrame>
  );
}
