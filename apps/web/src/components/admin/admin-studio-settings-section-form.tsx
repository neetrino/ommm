"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminStudioContactSettingsFields } from "@/components/admin/admin-studio-contact-settings-fields";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import type { StudioSettingsSectionId } from "@/components/admin/admin-studio-settings-module";
import {
  AdminSheetEditableField,
  adminSheetFieldInputClass,
} from "@/components/admin/admin-sheet-editable-field";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatPhoneDisplay, normalizePhoneForApi } from "@/lib/phone";
import {
  collectStudioSettingsFieldErrors,
  type StudioSettingsFieldErrors,
} from "@/lib/studio-contact-validation";
import {
  buildStudioSocialLinksJson,
  getStudioSocialPlatformUrl,
  type StudioPublicSettings,
} from "@/lib/studio-social-links";

type AdminStudioSettingsSectionFormProps = {
  initial: StudioPublicSettings;
  section: StudioSettingsSectionId;
};

export function AdminStudioSettingsSectionForm({
  initial,
  section,
}: AdminStudioSettingsSectionFormProps) {
  const t = useTranslations("adminActions.studio");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [fieldErrors, setFieldErrors] = useState<StudioSettingsFieldErrors>({});

  const [studioName, setStudioName] = useState(initial.studioName);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(
    formatPhoneDisplay(initial.contactPhone ?? ""),
  );
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
          contactPhone: contactPhone.trim() ? normalizePhoneForApi(contactPhone) : null,
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
      <AdminSectionShell banner={statusBanner}>
        {msg && tone === "err" ? (
          <p
            className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
            role="alert"
          >
            {msg}
          </p>
        ) : null}

        <section className={adminChrome.panel}>
          {section === "identity" ? (
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
          ) : null}

          {section === "location" ? (
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
          ) : null}

          {section === "contact" ? (
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
          ) : null}
        </section>
      </AdminSectionShell>

      <footer className={`${adminChrome.panel} flex justify-end`}>
        <OmmButton type="submit" variant="primary" disabled={busy}>
          {busy ? t("saving") : t("save")}
        </OmmButton>
      </footer>
    </form>
  );
}
