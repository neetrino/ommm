"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { useClientEditForm } from "@/components/admin/admin-client-edit-form.use";
import type {
  ClientDetail,
  ClientSheetBookingItem,
  ClientSheetGiftCardItem,
  ClientSheetPaymentItem,
} from "@/components/admin/admin-clients-types";
import {
  ClientGiftActionPanel,
  ClientNotesPanel,
} from "@/components/admin/admin-client-drawer-sections";
import { ClientPackagesPanel } from "@/components/admin/admin-client-packages-panel";
import { ClientSheetPaginatedTab } from "@/components/admin/admin-client-sheet-paginated-tab";
import {
  CLIENT_SHEET_TAB_BOOKINGS,
  CLIENT_SHEET_TAB_GIFTS,
  CLIENT_SHEET_TAB_NOTES,
  CLIENT_SHEET_TAB_PACKAGES,
  CLIENT_SHEET_TAB_PAYMENTS,
  CLIENT_SHEET_TAB_PROFILE,
} from "@/components/admin/admin-client-sheet-tabs";
import {
  AdminSheetEditableField,
  AdminSheetReadOnlyField,
  ADMIN_SHEET_FORM_SECTION_CLASS,
} from "@/components/admin/admin-sheet-editable-field";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { apiFetch } from "@/lib/api";
import { formatBirthdayInput, formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
import { formatPhoneDisplay } from "@/lib/phone";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { isManualPaymentMethod } from "@/lib/manual-payment-method";
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
  tabRefreshKey?: number;
  personalInfoEditing: boolean;
  onStartPersonalInfoEdit: () => void;
  onPersonalInfoSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAvatarPreviewOpenChange?: (open: boolean) => void;
  allowPackagePurchase?: boolean;
  onPackagePurchaseSuccess?: () => void;
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
  tabRefreshKey = 0,
  personalInfoEditing,
  onStartPersonalInfoEdit,
  onPersonalInfoSubmit,
  onAvatarPreviewOpenChange,
  allowPackagePurchase = false,
  onPackagePurchaseSuccess,
}: ClientSheetTabPanelsProps) {
  const t = useTranslations("adminPages.clients");
  const tFinance = useTranslations("adminPages.finance");
  const activity = detail.activity;

  if (activeTab === CLIENT_SHEET_TAB_PROFILE) {
    return (
      <div className="space-y-5">
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ClientAvatar client={detail} onPreviewOpenChange={onAvatarPreviewOpenChange} />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <StatusBadge label={activity.status} />
              <span className="text-sm text-sage-600">
                {t("drawer.registered")}: {formatDateForUi(detail.createdAt)}
              </span>
            </div>
          </div>
          {activity.preferredCoach ? (
            <p className="mt-3 text-sm text-sage-600">
              {t("drawer.preferredCoach")}: {activity.preferredCoach.name}
            </p>
          ) : null}

          <div className="mt-5 border-t border-white/70 pt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
                {t("drawer.personalInfo")}
              </h3>
              {!personalInfoEditing ? (
                <EditActionButton
                  ariaLabel={t("edit")}
                  onClick={onStartPersonalInfoEdit}
                  disabled={busy}
                />
              ) : null}
            </div>
            {personalInfoEditing ? (
              <form className="grid gap-4 lg:grid-cols-2" onSubmit={onPersonalInfoSubmit}>
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
                <AdminSheetEditableField label={t("fieldPhone")} error={errors.phone}>
                  <PhoneInputField
                    autoComplete="tel"
                    className="ommm-input"
                    value={form.phone}
                    onValueChange={(value) => controller.updateField("phone", value)}
                    disabled={busy}
                  />
                </AdminSheetEditableField>
                <AdminSheetEditableField
                  label={t("fieldBirthday")}
                  error={errors.dateOfBirth}
                  className="lg:col-span-2"
                >
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
              </form>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminSheetReadOnlyField
                  label={t("fieldEmail")}
                  value={form.email.trim().length > 0 ? form.email : "—"}
                  className="lg:col-span-2"
                />
                <AdminSheetReadOnlyField
                  label={t("fieldName")}
                  value={form.name.trim().length > 0 ? form.name : "—"}
                />
                <AdminSheetReadOnlyField
                  label={t("fieldLastName")}
                  value={form.lastName.trim().length > 0 ? form.lastName : "—"}
                />
                <AdminSheetReadOnlyField
                  label={t("fieldPhone")}
                  value={form.phone.trim().length > 0 ? formatPhoneDisplay(form.phone) : "—"}
                />
                <AdminSheetReadOnlyField
                  label={t("fieldBirthday")}
                  value={form.dateOfBirth.trim().length > 0 ? form.dateOfBirth : "—"}
                  className="lg:col-span-2"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === CLIENT_SHEET_TAB_PACKAGES) {
    return (
      <ClientPackagesPanel
        client={detail}
        locale={locale}
        active
        refreshKey={tabRefreshKey}
        allowPurchase={allowPackagePurchase}
        onPurchaseSuccess={() => onPackagePurchaseSuccess?.()}
      />
    );
  }

  if (activeTab === CLIENT_SHEET_TAB_BOOKINGS) {
    return (
      <ClientSheetPaginatedTab<ClientSheetBookingItem>
        clientId={detail.id}
        active
        refreshKey={tabRefreshKey}
        endpoint={`/clients/${detail.id}/bookings`}
        title={t("drawer.bookingHistory")}
        empty={t("drawer.noBookings")}
        mapItem={(booking) => ({
          id: booking.id,
          main: booking.session.classType.name,
          meta: `${formatDateTimeForUi(booking.session.startsAt, locale)} · ${booking.status} · ${booking.session.level ?? "—"}`,
          extra: booking.cancelledAt
            ? `${t("drawer.cancelled")} ${formatDateForUi(booking.cancelledAt)}`
            : booking.attendedAt
              ? `${t("drawer.attended")} ${formatDateForUi(booking.attendedAt)}`
              : null,
        })}
      />
    );
  }

  if (activeTab === CLIENT_SHEET_TAB_PAYMENTS) {
    return (
      <ClientSheetPaginatedTab<ClientSheetPaymentItem>
        clientId={detail.id}
        active
        refreshKey={tabRefreshKey}
        endpoint={`/clients/${detail.id}/payments`}
        title={t("drawer.paymentHistory")}
        empty={t("drawer.noPayments")}
        mapItem={(payment) => {
          const methodLabel =
            payment.paymentMethod !== null && isManualPaymentMethod(payment.paymentMethod)
              ? tFinance(`paymentMethods.${payment.paymentMethod}`)
              : null;
          return {
            id: payment.id,
            main: formatAmdFromCents(payment.amountCents, locale),
            meta: [
              payment.status,
              methodLabel,
              formatDateForUi(payment.createdAt),
            ]
              .filter(Boolean)
              .join(" · "),
            extra: payment.description,
          };
        }}
      />
    );
  }

  if (activeTab === CLIENT_SHEET_TAB_GIFTS) {
    return (
      <div className="space-y-5">
        <ClientGiftActionPanel
          client={detail}
          giftAmount={giftAmount}
          busy={actionBusy}
          onGiftAmountChange={onGiftAmountChange}
          onRun={onRun}
        />
        <ClientSheetPaginatedTab<ClientSheetGiftCardItem>
          clientId={detail.id}
          active
          refreshKey={tabRefreshKey}
          endpoint={`/clients/${detail.id}/gift-cards`}
          title={t("drawer.giftCards")}
          empty={t("drawer.noGiftCards")}
          mapItem={(card) => ({
            id: card.id,
            main: `${formatAmdFromCents(card.balanceCents, locale)} / ${formatAmdFromCents(card.amountCents, locale)}`,
            meta: `${card.status} · ${card.relation} · ${formatDateForUi(card.createdAt)}`,
            extra: card.recipientName ?? card.recipientEmail,
          })}
        />
      </div>
    );
  }

  if (activeTab === CLIENT_SHEET_TAB_NOTES) {
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

const CLIENT_AVATAR_BUTTON_CLASS =
  "group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-sand-100 shadow-[0_12px_32px_-20px_rgba(45,40,35,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function ClientAvatar({
  client,
  onPreviewOpenChange,
}: {
  client: { avatarUrl: string | null; name: string | null; lastName: string | null; email: string };
  onPreviewOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations("adminPages.clients");
  const [previewOpen, setPreviewOpen] = useState(false);
  const displayName = clientDisplayName(client);
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const src =
    client.avatarUrl !== null
      ? resolveApiAssetUrl(client.avatarUrl) ?? client.avatarUrl
      : null;

  useEffect(() => {
    onPreviewOpenChange?.(previewOpen);
  }, [onPreviewOpenChange, previewOpen]);

  useEffect(
    () => () => {
      onPreviewOpenChange?.(false);
    },
    [onPreviewOpenChange],
  );

  function closePreview(): void {
    setPreviewOpen(false);
  }

  if (src !== null) {
    return (
      <>
        <button
          type="button"
          className={CLIENT_AVATAR_BUTTON_CLASS}
          aria-label={t("drawer.viewPhoto")}
          onClick={(event) => {
            event.stopPropagation();
            setPreviewOpen(true);
          }}
        >
          <Image
            src={src}
            alt=""
            width={96}
            height={96}
            className="h-full w-full object-cover"
            unoptimized
          />
          <span className="absolute inset-0 flex items-center justify-center bg-sage-900/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-sage-900/35 group-hover:opacity-100 group-focus-visible:bg-sage-900/35 group-focus-visible:opacity-100">
            {t("drawer.viewPhoto")}
          </span>
        </button>
        <ImagePreviewModal
          isOpen={previewOpen}
          imageSrc={src}
          imageAlt={t("drawer.photoPreviewAlt", { name: displayName })}
          closeAriaLabel={t("modalCloseAria")}
          backdropAriaLabel={t("modalBackdropClose")}
          onClose={closePreview}
        />
      </>
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
