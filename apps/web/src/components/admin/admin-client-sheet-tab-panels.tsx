"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { useClientEditForm } from "@/components/admin/admin-client-edit-form.use";
import type { ClientDetail } from "@/components/admin/admin-clients-types";
import {
  ClientGiftActionPanel,
  ClientHistoryList,
  ClientNotesPanel,
} from "@/components/admin/admin-client-drawer-sections";
import {
  AdminSheetEditableField,
  ADMIN_SHEET_FORM_SECTION_CLASS,
} from "@/components/admin/admin-sheet-editable-field";
import { apiFetch } from "@/lib/api";
import { formatBirthdayInput, formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type ClientFormController = ReturnType<typeof useClientEditForm>;

const SECTION_CLASS = ADMIN_SHEET_FORM_SECTION_CLASS;

type ClientSheetTabPanelsProps = {
  activeTab: string;
  locale: string;
  detail: ClientDetail;
  form: ClientFormController["form"];
  errors: ClientFormController["errors"];
  busy: boolean;
  controller: ClientFormController;
  giftAmount: string;
  note: string;
  actionBusy: string | null;
  onGiftAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onRun: (key: string, action: () => Promise<void>, ok: string) => Promise<void>;
};

export function ClientSheetTabPanels({
  activeTab,
  locale,
  detail,
  form,
  errors,
  busy,
  controller,
  giftAmount,
  note,
  actionBusy,
  onGiftAmountChange,
  onNoteChange,
  onRun,
}: ClientSheetTabPanelsProps) {
  const t = useTranslations("adminPages.clients");
  const activity = detail.activity;

  if (activeTab === "profile") {
    return (
      <div className="space-y-5">
        <section className={SECTION_CLASS}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ClientAvatar client={detail} />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <StatusBadge label={activity.status} />
              <span className="text-sm text-sage-600">
                {t("drawer.registered")}: {formatDateForUi(detail.createdAt)}
              </span>
              {activity.source ? (
                <span className="text-sm text-sage-600">
                  {t("drawer.source")}: {activity.source}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {activity.tags.length === 0 ? (
              <Badge label={t("drawer.noTags")} />
            ) : (
              activity.tags.map((tag) => <Badge key={tag} label={tag} />)
            )}
          </div>
          {activity.preferredCoach ? (
            <p className="mt-3 text-sm text-sage-600">
              {t("drawer.preferredCoach")}: {activity.preferredCoach.name}
            </p>
          ) : null}
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Metric label={t("drawer.totalVisits")} value={String(activity.totalVisits)} />
          <Metric label={t("drawer.totalBookings")} value={String(activity.totalBookings)} />
          <Metric label={t("drawer.cancellations")} value={String(activity.totalCancellations)} />
          <Metric label={t("drawer.noShows")} value={String(activity.totalNoShows)} />
          <Metric
            label={t("drawer.lastVisit")}
            value={activity.lastVisitDate ? formatDateForUi(activity.lastVisitDate) : "—"}
          />
          <Metric
            label={t("drawer.lifetimeValue")}
            value={formatAmdFromCents(activity.lifetimeValueCents, locale)}
          />
        </div>

        <section className={SECTION_CLASS}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            {t("drawer.personalInfo")}
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <AdminSheetEditableField label={t("fieldEmail")} error={errors.email} className="lg:col-span-2">
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="ommm-input"
                value={form.email}
                onChange={(event) => controller.updateField("email", event.target.value)}
                disabled={busy}
              />
            </AdminSheetEditableField>
            <AdminSheetEditableField label={t("fieldName")} error={undefined}>
              <input
                type="text"
                autoComplete="given-name"
                className="ommm-input"
                value={form.name}
                onChange={(event) => controller.updateField("name", event.target.value)}
                disabled={busy}
              />
            </AdminSheetEditableField>
            <AdminSheetEditableField label={t("fieldLastName")} error={undefined}>
              <input
                type="text"
                autoComplete="family-name"
                className="ommm-input"
                value={form.lastName}
                onChange={(event) => controller.updateField("lastName", event.target.value)}
                disabled={busy}
              />
            </AdminSheetEditableField>
            <AdminSheetEditableField label={t("fieldPhone")} error={undefined}>
              <input
                type="tel"
                autoComplete="tel"
                className="ommm-input"
                value={form.phone}
                onChange={(event) => controller.updateField("phone", event.target.value)}
                disabled={busy}
              />
            </AdminSheetEditableField>
            <AdminSheetEditableField label={t("fieldBirthday")} error={errors.dateOfBirth} className="lg:col-span-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="bday"
                maxLength={10}
                placeholder={t("birthdayPlaceholder")}
                className="ommm-input"
                value={form.dateOfBirth}
                onChange={(event) =>
                  controller.updateField("dateOfBirth", formatBirthdayInput(event.target.value))
                }
                disabled={busy}
              />
            </AdminSheetEditableField>
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "bookings") {
    return (
      <ClientHistoryList
        title={t("drawer.bookingHistory")}
        empty={t("drawer.noBookings")}
        items={detail.bookings.map((booking) => ({
          id: booking.id,
          main: booking.session.classType.name,
          meta: `${formatDateTimeForUi(booking.session.startsAt, locale)} · ${booking.status} · ${booking.session.level ?? "—"}`,
          extra: booking.cancelledAt
            ? `${t("drawer.cancelled")} ${formatDateForUi(booking.cancelledAt)}`
            : booking.attendedAt
              ? `${t("drawer.attended")} ${formatDateForUi(booking.attendedAt)}`
              : null,
        }))}
      />
    );
  }

  if (activeTab === "payments") {
    return (
      <ClientHistoryList
        title={t("drawer.paymentHistory")}
        empty={t("drawer.noPayments")}
        items={detail.payments.map((payment) => ({
          id: payment.id,
          main: formatAmdFromCents(payment.amountCents, locale),
          meta: `${payment.status} · ${formatDateForUi(payment.createdAt)}`,
          extra: payment.description,
        }))}
      />
    );
  }

  if (activeTab === "gifts") {
    return (
      <div className="space-y-5">
        <ClientGiftActionPanel
          client={detail}
          giftAmount={giftAmount}
          busy={actionBusy}
          onGiftAmountChange={onGiftAmountChange}
          onRun={onRun}
        />
        <ClientHistoryList
          title={t("drawer.giftCards")}
          empty={t("drawer.noGiftCards")}
          items={[...detail.giftCardsPurchased, ...detail.giftCardsReceived].map((card) => ({
            id: card.id,
            main: `${formatAmdFromCents(card.balanceCents, locale)} / ${formatAmdFromCents(card.amountCents, locale)}`,
            meta: `${card.status} · ${formatDateForUi(card.createdAt)}`,
            extra: card.recipientName ?? card.recipientEmail,
          }))}
        />
      </div>
    );
  }

  if (activeTab === "notes") {
    return (
      <ClientNotesPanel
        notes={detail.notes}
        note={note}
        busy={actionBusy !== null}
        onNoteChange={onNoteChange}
        onAdd={() =>
          void onRun(
            "note",
            () =>
              apiFetch(`/clients/${detail.id}/notes`, {
                method: "POST",
                body: JSON.stringify({ body: note.trim() }),
              }).then(() => undefined),
            t("noteAddedSuccess"),
          )
        }
      />
    );
  }

  return null;
}

function ClientAvatar({
  client,
}: {
  client: { avatarUrl: string | null; name: string | null; lastName: string | null; email: string };
}) {
  const initials = clientDisplayName(client)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const src =
    client.avatarUrl !== null
      ? resolveApiAssetUrl(client.avatarUrl) ?? client.avatarUrl
      : null;

  if (src !== null) {
    return (
      <Image
        src={src}
        alt=""
        width={96}
        height={96}
        className="h-24 w-24 shrink-0 rounded-2xl object-cover"
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-2xl font-semibold text-sage-800">
      {initials || "?"}
    </div>
  );
}

function clientDisplayName(client: {
  name: string | null;
  lastName: string | null;
  email: string;
}): string {
  const value = [client.name, client.lastName].filter(Boolean).join(" ").trim();
  return value.length > 0 ? value : client.email;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-sage-500">{label}</p>
      <p className="mt-1 font-semibold text-sage-900">{value}</p>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-mint-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-sage-800">
      {label}
    </span>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs font-medium text-sage-800">
      {label}
    </span>
  );
}
