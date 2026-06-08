"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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

const COMPACT_SECTION =
  "rounded-[20px] border border-white/60 bg-white/60 p-3 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-4";
const COMPACT_INPUT = "ommm-input h-9 text-sm";

type SettingsFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

function SettingsField({ label, hint, children, className = "" }: SettingsFieldProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`.trim()} title={hint}>
      <span className="ommm-label text-[11px] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

type CompactSectionProps = {
  heading: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

function CompactSection({ heading, description, children, className = "" }: CompactSectionProps) {
  return (
    <section className={`${COMPACT_SECTION} ${className}`.trim()}>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-sage-800">
          {heading}
        </h3>
        <p className="text-[11px] text-sage-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

type SummaryTileProps = {
  icon: "settings" | "send" | "calendar";
  title: string;
  value: string;
};

function SummaryTile({ icon, title, value }: SummaryTileProps) {
  return (
    <li className="rounded-[16px] border border-white/60 bg-white/65 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.22)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-sage-500">{title}</p>
        <DashboardNavIcon name={icon} className="h-4 w-4 text-sage-500" />
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-sage-900">{value}</p>
    </li>
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

  const summaryTiles = useMemo(
    () => [
      {
        key: "identity",
        icon: "settings" as const,
        title: t("tiles.identity.title"),
        value: studioName.trim() || t("tiles.identity.empty"),
      },
      {
        key: "contact",
        icon: "send" as const,
        title: t("tiles.contact.title"),
        value: contactEmail.trim() || contactPhone.trim() || t("tiles.contact.empty"),
      },
      {
        key: "policies",
        icon: "calendar" as const,
        title: t("tiles.policies.title"),
        value: t("tiles.policies.value", {
          hours: cancellationHoursNotice || "0",
          minutes: waitlistOfferMinutes || "0",
        }),
      },
    ],
    [cancellationHoursNotice, contactEmail, contactPhone, studioName, t, waitlistOfferMinutes],
  );

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
    <form onSubmit={save} className="flex flex-col gap-4">
      <ul className="grid gap-2 sm:grid-cols-3">
        {summaryTiles.map((tile) => (
          <SummaryTile key={tile.key} icon={tile.icon} title={tile.title} value={tile.value} />
        ))}
      </ul>

      {msg ? (
        <p
          className={`rounded-xl border px-3 py-2 text-xs ${
            tone === "ok"
              ? "border-mint-200/80 bg-mint-50/90 text-sage-800"
              : "border-red-200/80 bg-red-50/90 text-red-800"
          }`}
          role="status"
        >
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <CompactSection
          heading={t("sections.contact.heading")}
          description={t("sections.contact.description")}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField
              label={t("studioName")}
              hint={t("hints.studioName")}
              className="sm:col-span-2"
            >
              <input
                className={COMPACT_INPUT}
                value={studioName}
                onChange={(event) => setStudioName(event.target.value)}
                disabled={busy}
                required
              />
            </SettingsField>
            <SettingsField label={t("contactEmail")} hint={t("hints.contactEmail")}>
              <input
                type="email"
                className={COMPACT_INPUT}
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                disabled={busy}
              />
            </SettingsField>
            <SettingsField label={t("contactPhone")} hint={t("hints.contactPhone")}>
              <input
                type="tel"
                className={COMPACT_INPUT}
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                disabled={busy}
              />
            </SettingsField>
            <SettingsField
              label={t("whatsappUrl")}
              hint={t("hints.whatsappUrl")}
              className="sm:col-span-2"
            >
              <input
                type="url"
                className={COMPACT_INPUT}
                value={whatsappUrl}
                onChange={(event) => setWhatsappUrl(event.target.value)}
                disabled={busy}
                placeholder="https://"
              />
            </SettingsField>
          </div>
        </CompactSection>

        <CompactSection
          heading={t("sections.location.heading")}
          description={t("sections.location.description")}
        >
          <div className="grid gap-3">
            <SettingsField label={t("address")} hint={t("hints.address")}>
              <input
                className={COMPACT_INPUT}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={busy}
              />
            </SettingsField>
            <SettingsField label={t("mapEmbedUrl")} hint={t("hints.mapEmbedUrl")}>
              <input
                type="url"
                className={COMPACT_INPUT}
                value={mapEmbedUrl}
                onChange={(event) => setMapEmbedUrl(event.target.value)}
                disabled={busy}
                placeholder="https://"
              />
            </SettingsField>
            <SettingsField label={t("workingHours")} hint={t("hints.workingHours")}>
              <textarea
                className="ommm-input min-h-[4.5rem] resize-y py-2 text-sm"
                value={workingHours}
                onChange={(event) => setWorkingHours(event.target.value)}
                disabled={busy}
              />
            </SettingsField>
          </div>
        </CompactSection>

        <CompactSection
          heading={t("sections.policies.heading")}
          description={t("sections.policies.description")}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField
              label={t("cancellationHoursNotice")}
              hint={t("hints.cancellationHoursNotice")}
            >
              <input
                type="number"
                min={0}
                className={`${COMPACT_INPUT} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={cancellationHoursNotice}
                onChange={(event) => setCancellationHoursNotice(event.target.value)}
                disabled={busy}
              />
            </SettingsField>
            <SettingsField label={t("waitlistOfferMinutes")} hint={t("hints.waitlistOfferMinutes")}>
              <input
                type="number"
                min={1}
                className={`${COMPACT_INPUT} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={waitlistOfferMinutes}
                onChange={(event) => setWaitlistOfferMinutes(event.target.value)}
                disabled={busy}
              />
            </SettingsField>
          </div>
        </CompactSection>
      </div>

      <div className="flex items-center justify-end gap-3 rounded-[20px] border border-white/60 bg-white/65 px-4 py-2.5 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.22)] backdrop-blur-md">
        <OmmButton type="submit" variant="primary" size="sm" disabled={busy}>
          {busy ? t("saving") : t("save")}
        </OmmButton>
      </div>
    </form>
  );
}
