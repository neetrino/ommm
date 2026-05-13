"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";

type StudioSettings = {
  studioName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappUrl: string | null;
  address: string | null;
  mapEmbedUrl: string | null;
  workingHours: string | null;
  socialLinksJson: string | null;
  cancellationHoursNotice: number;
  waitlistOfferMinutes: number;
};

type AdminStudioSettingsFormProps = {
  initial: StudioSettings;
};

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
  const [socialLinksJson, setSocialLinksJson] = useState(initial.socialLinksJson ?? "");
  const [cancellationHoursNotice, setCancellationHoursNotice] = useState(
    String(initial.cancellationHoursNotice),
  );
  const [waitlistOfferMinutes, setWaitlistOfferMinutes] = useState(
    String(initial.waitlistOfferMinutes),
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
          socialLinksJson: socialLinksJson.trim() || null,
          cancellationHoursNotice: Number.parseInt(cancellationHoursNotice, 10),
          waitlistOfferMinutes: Number.parseInt(waitlistOfferMinutes, 10),
        }),
      });
      setTone("ok");
      setMsg(t("saved"));
      window.location.reload();
    } catch (error) {
      setTone("err");
      setMsg(error instanceof ApiError ? error.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-2 sm:grid-cols-2">
      <input
        className="app-input h-9 text-xs"
        value={studioName}
        onChange={(event) => setStudioName(event.target.value)}
        placeholder={t("studioName")}
      />
      <input
        className="app-input h-9 text-xs"
        value={contactEmail}
        onChange={(event) => setContactEmail(event.target.value)}
        placeholder={t("contactEmail")}
      />
      <input
        className="app-input h-9 text-xs"
        value={contactPhone}
        onChange={(event) => setContactPhone(event.target.value)}
        placeholder={t("contactPhone")}
      />
      <input
        className="app-input h-9 text-xs"
        value={whatsappUrl}
        onChange={(event) => setWhatsappUrl(event.target.value)}
        placeholder={t("whatsappUrl")}
      />
      <input
        className="app-input h-9 text-xs sm:col-span-2"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder={t("address")}
      />
      <input
        className="app-input h-9 text-xs sm:col-span-2"
        value={mapEmbedUrl}
        onChange={(event) => setMapEmbedUrl(event.target.value)}
        placeholder={t("mapEmbedUrl")}
      />
      <input
        className="app-input h-9 text-xs sm:col-span-2"
        value={workingHours}
        onChange={(event) => setWorkingHours(event.target.value)}
        placeholder={t("workingHours")}
      />
      <input
        className="app-input h-9 text-xs sm:col-span-2"
        value={socialLinksJson}
        onChange={(event) => setSocialLinksJson(event.target.value)}
        placeholder={t("socialLinksJson")}
      />
      <input
        type="number"
        min={0}
        className="app-input h-9 text-xs"
        value={cancellationHoursNotice}
        onChange={(event) => setCancellationHoursNotice(event.target.value)}
        placeholder={t("cancellationHoursNotice")}
      />
      <input
        type="number"
        min={1}
        className="app-input h-9 text-xs"
        value={waitlistOfferMinutes}
        onChange={(event) => setWaitlistOfferMinutes(event.target.value)}
        placeholder={t("waitlistOfferMinutes")}
      />
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:col-span-2"
        disabled={busy}
      >
        {busy ? t("saving") : t("save")}
      </button>
      {msg ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"} sm:col-span-2`}>
          {msg}
        </p>
      ) : null}
    </form>
  );
}
