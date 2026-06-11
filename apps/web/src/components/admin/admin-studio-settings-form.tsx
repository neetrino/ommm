"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import {
  AdminSheetEditableField,
  adminSheetFieldInputClass,
} from "@/components/admin/admin-sheet-editable-field";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type StudioSettings = {
  studioName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappUrl: string | null;
  address: string | null;
  mapEmbedUrl: string | null;
  workingHours: string | null;
  cancellationHoursNotice: number;
  waitlistOfferMinutes: number;
};

type AdminStudioSettingsFormProps = {
  initial: StudioSettings;
};

const NUMBER_INPUT_CLASS =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

type SettingsSectionProps = {
  heading: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

function SettingsSection({ heading, description, children, className = "" }: SettingsSectionProps) {
  return (
    <section className={`${adminChrome.panel} ${className}`.trim()}>
      <h2 className={adminChrome.panelHeading}>{heading}</h2>
      <p className={`${adminChrome.metaText} mt-1 max-w-2xl`}>{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

type SummaryMetricProps = {
  icon: "settings" | "send" | "calendar";
  label: string;
  value: string;
  helper: string;
};

function SummaryMetric({ icon, label, value, helper }: SummaryMetricProps) {
  return (
    <article className={adminChrome.metricCard}>
      <div className="flex items-start justify-between gap-3">
        <p className={adminChrome.metricLabel}>{label}</p>
        <DashboardNavIcon name={icon} className="h-4 w-4 shrink-0 text-sage-500" />
      </div>
      <p className="mt-2 truncate text-lg font-semibold text-sage-900">{value}</p>
      <p className={`${adminChrome.metaText} mt-1`}>{helper}</p>
    </article>
  );
}

export function AdminStudioSettingsForm({ initial }: AdminStudioSettingsFormProps) {
  const t = useTranslations("adminActions.studio");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  const [studioName, setStudioName] = useState(initial.studioName);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initial.contactPhone ?? "");
  const [whatsappUrl, setWhatsappUrl] = useState(initial.whatsappUrl ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial.mapEmbedUrl ?? "");
  const [workingHours, setWorkingHours] = useState(initial.workingHours ?? "");
  const [cancellationHoursNotice, setCancellationHoursNotice] = useState(
    String(initial.cancellationHoursNotice),
  );
  const [waitlistOfferMinutes, setWaitlistOfferMinutes] = useState(
    String(initial.waitlistOfferMinutes),
  );

  const summaryMetrics = useMemo(
    () => [
      {
        key: "identity",
        icon: "settings" as const,
        label: t("tiles.identity.title"),
        value: studioName.trim() || t("tiles.identity.empty"),
        helper: t("tiles.identity.helper"),
      },
      {
        key: "contact",
        icon: "send" as const,
        label: t("tiles.contact.title"),
        value: contactEmail.trim() || contactPhone.trim() || t("tiles.contact.empty"),
        helper: t("tiles.contact.helper"),
      },
      {
        key: "policies",
        icon: "calendar" as const,
        label: t("tiles.policies.title"),
        value: t("tiles.policies.value", {
          hours: cancellationHoursNotice || "0",
          minutes: waitlistOfferMinutes || "0",
        }),
        helper: t("tiles.policies.helper"),
      },
    ],
    [cancellationHoursNotice, contactEmail, contactPhone, studioName, t, waitlistOfferMinutes],
  );

  const statusBanner = msg && tone === "ok" ? msg : null;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch("/studio", {
        method: "PATCH",
        body: JSON.stringify({
          studioName: studioName.trim(),
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          whatsappUrl: whatsappUrl.trim() || null,
          address: address.trim() || null,
          mapEmbedUrl: mapEmbedUrl.trim() || null,
          workingHours: workingHours.trim() || null,
          cancellationHoursNotice: Number.parseInt(cancellationHoursNotice, 10),
          waitlistOfferMinutes: Number.parseInt(waitlistOfferMinutes, 10),
        }),
      });
      setTone("ok");
      setMsg(t("saved"));
    } catch (error) {
      setTone("err");
      setMsg(error instanceof ApiError ? error.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <section className="rounded-[24px] border border-white/50 bg-white/35 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] backdrop-blur-md sm:p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
          {t("title")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryMetrics.map(({ key, ...metric }) => (
            <SummaryMetric key={key} {...metric} />
          ))}
        </div>
      </section>

      <AdminSectionShell banner={statusBanner}>
        {msg && tone === "err" ? (
          <p
            className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
            role="alert"
          >
            {msg}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsSection
            heading={t("sections.identity.heading")}
            description={t("sections.identity.description")}
          >
            <AdminSheetEditableField
              label={t("studioName")}
              hint={t("hints.studioName")}
              required
            >
              <input
                className={adminSheetFieldInputClass()}
                value={studioName}
                onChange={(event) => setStudioName(event.target.value)}
                disabled={busy}
                required
              />
            </AdminSheetEditableField>
          </SettingsSection>

          <SettingsSection
            heading={t("sections.contact.heading")}
            description={t("sections.contact.description")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSheetEditableField label={t("contactEmail")} hint={t("hints.contactEmail")}>
                <input
                  type="email"
                  className={adminSheetFieldInputClass()}
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("contactPhone")} hint={t("hints.contactPhone")}>
                <input
                  type="tel"
                  className={adminSheetFieldInputClass()}
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField
                label={t("whatsappUrl")}
                hint={t("hints.whatsappUrl")}
                className="sm:col-span-2"
              >
                <input
                  type="url"
                  className={adminSheetFieldInputClass()}
                  value={whatsappUrl}
                  onChange={(event) => setWhatsappUrl(event.target.value)}
                  disabled={busy}
                  placeholder="https://"
                />
              </AdminSheetEditableField>
            </div>
          </SettingsSection>

          <SettingsSection
            heading={t("sections.location.heading")}
            description={t("sections.location.description")}
          >
            <div className="grid gap-4">
              <AdminSheetEditableField label={t("address")} hint={t("hints.address")}>
                <input
                  className={adminSheetFieldInputClass()}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("mapEmbedUrl")} hint={t("hints.mapEmbedUrl")}>
                <input
                  type="url"
                  className={adminSheetFieldInputClass()}
                  value={mapEmbedUrl}
                  onChange={(event) => setMapEmbedUrl(event.target.value)}
                  disabled={busy}
                  placeholder="https://"
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("workingHours")} hint={t("hints.workingHours")}>
                <textarea
                  className={adminSheetFieldInputClass(false, "min-h-[5.5rem] resize-y py-2.5")}
                  value={workingHours}
                  onChange={(event) => setWorkingHours(event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
            </div>
          </SettingsSection>

          <SettingsSection
            heading={t("sections.policies.heading")}
            description={t("sections.policies.description")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSheetEditableField
                label={t("cancellationHoursNotice")}
                hint={t("hints.cancellationHoursNotice")}
              >
                <input
                  type="number"
                  min={0}
                  className={adminSheetFieldInputClass(false, NUMBER_INPUT_CLASS)}
                  value={cancellationHoursNotice}
                  onChange={(event) => setCancellationHoursNotice(event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField
                label={t("waitlistOfferMinutes")}
                hint={t("hints.waitlistOfferMinutes")}
              >
                <input
                  type="number"
                  min={1}
                  className={adminSheetFieldInputClass(false, NUMBER_INPUT_CLASS)}
                  value={waitlistOfferMinutes}
                  onChange={(event) => setWaitlistOfferMinutes(event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
            </div>
          </SettingsSection>
        </div>
      </AdminSectionShell>

      <footer className={`${adminChrome.panel} flex justify-end`}>
        <OmmButton type="submit" variant="primary" disabled={busy}>
          {busy ? t("saving") : t("save")}
        </OmmButton>
      </footer>
    </form>
  );
}
