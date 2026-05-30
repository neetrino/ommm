"use client";

import { OmmButton } from "@/components/ui/omm-button";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { ClientDetail, MembershipPlanOption } from "./admin-clients-types";

type RunAction = (key: string, action: () => Promise<void>, ok: string) => Promise<void>;

export function ActionSection(props: {
  client: ClientDetail;
  plans: MembershipPlanOption[];
  planId: string;
  giftAmount: string;
  busy: string | null;
  onPlanChange: (value: string) => void;
  onGiftAmountChange: (value: string) => void;
  onRun: RunAction;
}) {
  const activeMembership = props.client.activity.activeMembership;
  return (
    <section className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="font-medium text-sage-900">Client actions</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/70 bg-white/65 p-3">
          <p className="text-xs uppercase tracking-wide text-sage-500">Membership</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <OmmButton
              size="sm"
              variant="ghost"
              disabled={!activeMembership || props.busy !== null}
              onClick={() => {
                if (activeMembership && window.confirm("Pause this membership?")) {
                  void props.onRun(
                    "pause",
                    () =>
                      apiFetch(`/memberships/admin/${activeMembership.id}/status`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "PAUSED" }),
                      }),
                    "Membership paused",
                  );
                }
              }}
            >
              Pause
            </OmmButton>
            <OmmButton
              size="sm"
              variant="danger"
              disabled={!activeMembership || props.busy !== null}
              onClick={() => {
                if (activeMembership && window.confirm("Cancel this membership?")) {
                  void props.onRun(
                    "cancel",
                    () =>
                      apiFetch(`/memberships/admin/${activeMembership.id}/status`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "CANCELLED" }),
                      }),
                    "Membership cancelled",
                  );
                }
              }}
            >
              Cancel
            </OmmButton>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="min-w-0 flex-1">
              <OmmFilterDropdown
                allValue=""
                value={props.planId}
                ariaLabel="Assign package"
                allLabel="Assign package..."
                onChange={props.onPlanChange}
                options={props.plans
                  .filter((plan) => plan.isActive)
                  .map((plan) => ({ value: plan.id, label: plan.name }))}
              />
            </div>
            <OmmButton
              size="sm"
              disabled={props.planId === "" || props.busy !== null}
              onClick={() =>
                void props.onRun(
                  "assign",
                  () =>
                    apiFetch("/memberships/admin/assign", {
                      method: "POST",
                      body: JSON.stringify({ userId: props.client.id, planId: props.planId }),
                    }),
                  "Package assigned",
                )
              }
            >
              Assign
            </OmmButton>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/65 p-3">
          <p className="text-xs uppercase tracking-wide text-sage-500">Gift card and account</p>
          <div className="mt-2 flex gap-2">
            <input
              className="ommm-input h-10 flex-1"
              type="number"
              min={1}
              value={props.giftAmount}
              onChange={(event) => props.onGiftAmountChange(event.target.value)}
              aria-label="Gift card amount in cents"
            />
            <OmmButton
              size="sm"
              disabled={props.busy !== null}
              onClick={() =>
                void props.onRun(
                  "gift",
                  () =>
                    apiFetch("/gift-cards/admin", {
                      method: "POST",
                      body: JSON.stringify({
                        amountCents: Number.parseInt(props.giftAmount, 10),
                        recipientEmail: props.client.email,
                        recipientName: fullName(props.client),
                      }),
                    }),
                  "Gift card created",
                )
              }
            >
              Give gift
            </OmmButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <OmmButton size="sm" variant="ghost" disabled>Delete unavailable</OmmButton>
            <OmmButton size="sm" variant="ghost" disabled>Block unavailable</OmmButton>
            <OmmButton size="sm" variant="subtle" disabled={props.busy !== null}>View badges</OmmButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HistorySections({ data, locale }: { data: ClientDetail; locale: string }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <HistoryList
        title="Booking history"
        empty="No bookings."
        items={data.bookings.slice(0, 12).map((booking) => ({
          id: booking.id,
          main: booking.session.classType.name,
          meta: `${formatDateTimeForUi(booking.session.startsAt, locale)} · ${booking.status} · ${booking.session.level ?? "—"}`,
          extra: booking.cancelledAt ? `Cancelled ${formatDateForUi(booking.cancelledAt)}` : booking.attendedAt ? `Attended ${formatDateForUi(booking.attendedAt)}` : null,
        }))}
      />
      <HistoryList
        title="Payment history"
        empty="No payments."
        items={data.payments.map((payment) => ({
          id: payment.id,
          main: formatAmdFromCents(payment.amountCents, locale),
          meta: `${payment.status} · ${formatDateForUi(payment.createdAt)}`,
          extra: payment.description,
        }))}
      />
      <HistoryList
        title="Gift cards"
        empty="No gift cards."
        items={[...data.giftCardsPurchased, ...data.giftCardsReceived].map((card) => ({
          id: card.id,
          main: `${formatAmdFromCents(card.balanceCents, locale)} / ${formatAmdFromCents(card.amountCents, locale)}`,
          meta: `${card.status} · ${formatDateForUi(card.createdAt)}`,
          extra: card.recipientName ?? card.recipientEmail,
        }))}
      />
      <HistoryList
        title="Membership history"
        empty="No memberships."
        items={data.memberships.map((membership) => ({
          id: membership.id,
          main: membership.plan.name,
          meta: `${membership.status} · ${formatDateForUi(membership.currentPeriodStart)} - ${formatDateForUi(membership.currentPeriodEnd)}`,
          extra: membership.plan.isUnlimited ? "Unlimited" : `${membership.sessionsRemaining ?? 0}/${membership.plan.sessionsPerMonth ?? "—"} sessions`,
        }))}
      />
    </div>
  );
}

export function NotesSection(props: {
  notes: ClientDetail["notes"];
  note: string;
  busy: boolean;
  onNoteChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <section className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="font-medium text-sage-900">Internal notes</p>
      <div className="mt-2 flex gap-2">
        <input
          className="ommm-input h-10 flex-1"
          value={props.note}
          onChange={(event) => props.onNoteChange(event.target.value)}
          placeholder="Add an internal note"
        />
        <OmmButton size="sm" disabled={props.busy || props.note.trim() === ""} onClick={props.onAdd}>
          Add note
        </OmmButton>
      </div>
      <div className="mt-3 space-y-2">
        {props.notes.length === 0 ? <p className="text-sm text-sage-500">No notes yet.</p> : null}
        {props.notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm">
            <p className="text-sage-800">{note.body}</p>
            <p className="mt-1 text-xs text-sage-500">{note.author.name ?? note.author.email} · {formatDateForUi(note.createdAt)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryList(props: {
  title: string;
  empty: string;
  items: Array<{ id: string; main: string; meta: string; extra: string | null }>;
}) {
  return (
    <section className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="font-medium text-sage-900">{props.title}</p>
      <div className="mt-2 space-y-2">
        {props.items.length === 0 ? <p className="text-sm text-sage-500">{props.empty}</p> : null}
        {props.items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/70 bg-white/65 px-3 py-2 text-sm">
            <p className="font-medium text-sage-900">{item.main}</p>
            <p className="text-xs text-sage-600">{item.meta}</p>
            {item.extra ? <p className="mt-1 text-xs text-sage-500">{item.extra}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function fullName(client: { name: string | null; lastName: string | null; email: string }) {
  return [client.name, client.lastName].filter(Boolean).join(" ").trim() || client.email;
}
