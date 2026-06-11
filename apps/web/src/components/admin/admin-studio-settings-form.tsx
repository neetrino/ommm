"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminStudioContactSettingsFields } from "@/components/admin/admin-studio-contact-settings-fields";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import {
  AdminSheetEditableField,
  adminSheetFieldInputClass,
} from "@/components/admin/admin-sheet-editable-field";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import {
  collectStudioSettingsFieldErrors,
  type StudioSettingsFieldErrors,
} from "@/lib/studio-contact-validation";
import {
  buildStudioSocialLinksJson,
  getStudioSocialPlatformUrl,
  type StudioPublicSettings,
} from "@/lib/studio-social-links";

type AdminStudioSettingsFormProps = {
  initial: StudioPublicSettings;
};

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
  icon: "settings" | "send";
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
  const [fieldErrors, setFieldErrors] = useState<StudioSettingsFieldErrors>({});

  const [studioName, setStudioName] = useState(initial.studioName);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initial.contactPhone ?? "");
  const [whatsappUrl, setWhatsappUrl] = useState(initial.whatsappUrl ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial.mapEmbedUrl ?? "");
  const [workingHours, setWorkingHours] = useState(initial.workingHours ?? "");
  const [socialLinksJson, setSocialLinksJson] = useState(initial.socialLinksJson);
  const [instagramUrl, setInstagramUrl] = useState(() =>
    getStudioSocialPlatformUrl(initial.socialLinksJson, "instagram"),
  );
  const [facebookUrl, setFacebookUrl] = useState(() =>
    getStudioSocialPlatformUrl(initial.socialLinksJson, "facebook"),
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
    ],
    [contactEmail, contactPhone, studioName, t],
  );

  const statusBanner = msg && tone === "ok" ? msg : null;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }

    const nextFieldErrors = collectStudioSettingsFieldErrors(
      { contactEmail, whatsappUrl, mapEmbedUrl, instagramUrl, facebookUrl },
      {
        invalidEmail: t("validation.invalidEmail"),
        invalidUrl: t("validation.invalidUrl"),
      },
    );
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      setTone("err");
      setMsg(t("validation.fixFields"));
      return;
    }

    setBusy(true);
    setMsg(null);
    const nextSocialLinksJson = buildStudioSocialLinksJson({
      instagramUrl,
      facebookUrl,
      existingJson: socialLinksJson,
    });
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
          socialLinksJson: nextSocialLinksJson,
        }),
      });
      setSocialLinksJson(nextSocialLinksJson);
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
        <div className="grid gap-4 sm:grid-cols-2">
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
            heading={t("sections.location.heading")}
            description={t("sections.location.description")}
          >
            <AdminSheetEditableField
              label={t("mapEmbedUrl")}
              hint={t("hints.mapEmbedUrl")}
              error={fieldErrors.mapEmbedUrl}
            >
              <input
                type="url"
                className={adminSheetFieldInputClass(fieldErrors.mapEmbedUrl !== undefined)}
                value={mapEmbedUrl}
                onChange={(event) => setMapEmbedUrl(event.target.value)}
                disabled={busy}
                placeholder="https://"
              />
            </AdminSheetEditableField>
          </SettingsSection>

          <SettingsSection
            heading={t("sections.contact.heading")}
            description={t("sections.contact.description")}
            className="lg:col-span-2"
          >
            <AdminStudioContactSettingsFields
              busy={busy}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
              address={address}
              workingHours={workingHours}
              instagramUrl={instagramUrl}
              facebookUrl={facebookUrl}
              whatsappUrl={whatsappUrl}
              fieldErrors={fieldErrors}
              labels={{
                contactPhone: t("contactPhone"),
                contactEmail: t("contactEmail"),
                address: t("address"),
                workingHours: t("workingHours"),
                instagramUrl: t("instagramUrl"),
                facebookUrl: t("facebookUrl"),
                whatsappUrl: t("whatsappUrl"),
                hints: {
                  contactPhone: t("hints.contactPhone"),
                  contactEmail: t("hints.contactEmail"),
                  address: t("hints.address"),
                  workingHours: t("hints.workingHours"),
                  instagramUrl: t("hints.instagramUrl"),
                  facebookUrl: t("hints.facebookUrl"),
                  whatsappUrl: t("hints.whatsappUrl"),
                },
              }}
              onContactPhoneChange={setContactPhone}
              onContactEmailChange={setContactEmail}
              onAddressChange={setAddress}
              onWorkingHoursChange={setWorkingHours}
              onInstagramUrlChange={setInstagramUrl}
              onFacebookUrlChange={setFacebookUrl}
              onWhatsappUrlChange={setWhatsappUrl}
            />
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
