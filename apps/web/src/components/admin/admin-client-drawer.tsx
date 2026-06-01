"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CancelGlyph } from "@/components/ui/admin-action-glyphs";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { EDIT_CLIENT_QUERY_KEY } from "@/components/admin/admin-clients-query";
import type { ClientDetail, ClientRow, PackageOption } from "./admin-clients-types";
import {
  ActionSection,
  HistorySections,
  NotesSection,
} from "./admin-client-drawer-sections";

type Props = {
  client: ClientRow | null;
  packages: PackageOption[];
  locale: string;
  onClose: () => void;
  onChanged: () => void;
};

function fullName(client: { name: string | null; lastName: string | null; email: string }) {
  const value = [client.name, client.lastName].filter(Boolean).join(" ").trim();
  return value || client.email;
}

function sessionsLabel(membership: ClientDetail["memberships"][number] | null) {
  if (!membership) return "—";
  if (membership.plan.isUnlimited) return "∞";
  return `${membership.sessionsRemaining ?? 0}/${membership.plan.sessionsPerMonth ?? "—"}`;
}

export function AdminClientDrawer({ client, packages, locale, onClose, onChanged }: Props) {
  const t = useTranslations("adminPages.clients");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [packageId, setPackageId] = useState("");
  const [giftAmount, setGiftAmount] = useState("10000");
  const wasEditingRef = useRef(false);

  const refreshDetail = useCallback(async () => {
    if (!client) return;
    const fresh = await apiFetch<ClientDetail>(`/clients/${client.id}`);
    setDetail(fresh);
  }, [client]);

  function openEditModal() {
    if (!client) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_CLIENT_QUERY_KEY, client.id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  useEffect(() => {
    if (!client) return;
    const isEditingThisClient = searchParams.get(EDIT_CLIENT_QUERY_KEY) === client.id;
    if (wasEditingRef.current && !isEditingThisClient) {
      void refreshDetail();
    }
    wasEditingRef.current = isEditingThisClient;
  }, [client, refreshDetail, searchParams]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setMessage(null);
      setDetail(null);
      setNote("");
      setPackageId("");
      void apiFetch<ClientDetail>(`/clients/${client.id}`)
        .then((payload) => {
          if (cancelled) return;
          setDetail(payload);
        })
        .catch(() => {
          if (!cancelled) setDetail(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    if (!client) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [client]);

  if (!client || typeof document === "undefined") return null;

  async function run(key: string, action: () => Promise<void>, ok: string) {
    if (busy || !client) return;
    const clientId = client.id;
    setBusy(key);
    setMessage(null);
    try {
      await action();
      setMessage(ok);
      onChanged();
      const fresh = await apiFetch<ClientDetail>(`/clients/${clientId}`);
      setDetail(fresh);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  const data = detail;
  const activity = data?.activity ?? client;

  return createPortal(
    <div className="ommm-drawer-overlay z-[90]">
      <button
        className="ommm-modal-backdrop"
        type="button"
        aria-label={t("modalBackdropClose")}
        onClick={onClose}
      />
      <aside className="relative z-10 h-full w-full max-w-3xl overflow-y-auto border-l border-white/60 bg-white/95 p-5 shadow-[-12px_0_32px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sage-500">Client profile</p>
            <h2 className="text-xl font-semibold text-sage-900">{fullName(client)}</h2>
            <p className="text-sm text-sage-600">{client.phone ?? "—"} · {client.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <EditActionButton
              ariaLabel={t("editClient")}
              title={t("editClient")}
              onClick={openEditModal}
            />
            <button
              type="button"
              className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              aria-label={t("modalCloseAria")}
              title={t("modalCloseAria")}
              onClick={onClose}
            >
              <CancelGlyph className="h-5 w-5" />
            </button>
          </div>
        </div>

        {message ? (
          <div className="mb-4 rounded-xl border border-sand-500/30 bg-white/75 p-3 text-sm text-sage-800">
            {message}
          </div>
        ) : null}

        {loading || !data ? (
          <p className="text-sm text-sage-600">{loading ? "Loading client data..." : "Client data unavailable."}</p>
        ) : (
          <div className="space-y-4">
            <BasicInfo data={data} locale={locale} />
            <SummaryGrid client={activity} locale={locale} />
            <ActionSection
              client={data}
              packages={packages}
              packageId={packageId}
              giftAmount={giftAmount}
              busy={busy}
              onPackageChange={setPackageId}
              onGiftAmountChange={setGiftAmount}
              onRun={run}
            />
            <HistorySections data={data} locale={locale} />
            <NotesSection
              notes={data.notes}
              note={note}
              busy={busy !== null}
              onNoteChange={setNote}
              onAdd={() =>
                void run(
                  "note",
                  () =>
                    apiFetch(`/clients/${client.id}/notes`, {
                      method: "POST",
                      body: JSON.stringify({ body: note.trim() }),
                    }).then(() => setNote("")),
                  "Note added",
                )
              }
            />
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}

function BasicInfo({ data, locale }: { data: ClientDetail; locale: string }) {
  return (
    <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
      <div className="flex gap-3">
        <Avatar client={data} />
        <div className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
          <Field label="Email" value={data.email} />
          <Field label="Phone" value={data.phone ?? "—"} />
          <Field label="Client ID" value={data.id} mono />
          <Field label="Date of birth" value={data.dateOfBirth ? formatDateForUi(data.dateOfBirth) : "—"} />
          <Field label="Register date" value={formatDateForUi(data.createdAt)} />
          <Field label="Status" value={data.activity.status} />
          <Field label="Source" value={data.activity.source ?? "—"} />
          <Field label="Preferred coach" value={data.activity.preferredCoach?.name ?? "—"} />
          <Field label="Sessions remaining" value={sessionsLabel(data.activity.activeMembership)} />
          <Field label="Lifetime value" value={formatAmdFromCents(data.activity.lifetimeValueCents, locale)} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.activity.tags.length === 0 ? <Badge label="No badges" /> : data.activity.tags.map((tag) => <Badge key={tag} label={tag} />)}
      </div>
    </section>
  );
}

function SummaryGrid({ client, locale }: { client: ClientRow; locale: string }) {
  const values = [
    ["Total visits", client.totalVisits],
    ["Total bookings", client.totalBookings],
    ["Cancellations", client.totalCancellations],
    ["No-shows", client.totalNoShows],
    ["Last visit", client.lastVisitDate ? formatDateForUi(client.lastVisitDate) : "—"],
    ["Lifetime value", formatAmdFromCents(client.lifetimeValueCents, locale)],
  ];
  return <div className="grid gap-2 sm:grid-cols-3">{values.map(([label, value]) => <Metric key={label} label={String(label)} value={String(value)} />)}</div>;
}

function Avatar({ client }: { client: { avatarUrl: string | null; name: string | null; lastName: string | null; email: string } }) {
  const initials = fullName(client).split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  if (client.avatarUrl) {
    return (
      <Image
        src={client.avatarUrl}
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 rounded-full object-cover"
        unoptimized
      />
    );
  }
  return <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sand-100 text-lg font-semibold text-sage-800">{initials || "?"}</div>;
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <p><span className="block text-xs uppercase tracking-wide text-sage-500">{label}</span><span className={mono ? "font-mono text-xs text-sage-800" : "text-sage-800"}>{value}</span></p>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3"><p className="text-xs uppercase tracking-wide text-sage-500">{label}</p><p className="mt-1 font-semibold text-sage-900">{value}</p></div>;
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs font-medium text-sage-800">{label}</span>;
}
