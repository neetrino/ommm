"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { CancelGlyph } from "@/components/ui/admin-action-glyphs";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";

import { formatDateForUi } from "@/lib/date-display";

import { formatAmdFromCents } from "@/lib/price-amd";

import { EDIT_CLIENT_QUERY_KEY } from "@/components/admin/admin-clients-query";

import type { ClientDetail, ClientRow } from "./admin-clients-types";

import {

  ActionSection,

  HistorySections,

  NotesSection,

} from "./admin-client-drawer-sections";



type Props = {

  client: ClientRow | null;

  locale: string;

  onClose: () => void;

  onChanged: () => void;

};



function fullName(client: { name: string | null; lastName: string | null; email: string }) {

  const value = [client.name, client.lastName].filter(Boolean).join(" ").trim();

  return value || client.email;

}



export function AdminClientDrawer({ client, locale, onClose, onChanged }: Props) {

  const t = useTranslations("adminPages.clients");

  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [detail, setDetail] = useState<ClientDetail | null>(null);

  const [loading, setLoading] = useState(false);

  const [busy, setBusy] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");

  const [note, setNote] = useState("");

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



  if (!client) return null;

  async function run(key: string, action: () => Promise<void>, ok: string) {

    if (busy || !client) return;

    const clientId = client.id;

    setBusy(key);

    setMessage(null);

    try {

      await action();

      setMessageTone("ok");

      setMessage(ok);

      onChanged();

      const fresh = await apiFetch<ClientDetail>(`/clients/${clientId}`);

      setDetail(fresh);

    } catch (error) {

      setMessageTone("err");

      setMessage(error instanceof ApiError ? error.message : "Action failed");

    } finally {

      setBusy(null);

    }

  }



  const data = detail;

  const activity = data?.activity ?? client;



  return (
    <OmmDrawerPortal
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sage-500">Client profile</p>
            <h2 className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>{fullName(client)}</h2>
            <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>
              {client.phone ?? "—"} · {client.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <EditActionButton
              ariaLabel={t("editClient")}
              title={t("editClient")}
              onClick={openEditModal}
            />
            <button
              type="button"
              className={`shrink-0 ${ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}`}
              aria-label={t("modalCloseAria")}
              title={t("modalCloseAria")}
              onClick={onClose}
            >
              <CancelGlyph className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        {message ? (
          <AdminCenterToast
            message={message}
            tone={messageTone}
            onDismiss={() => setMessage(null)}
          />
        ) : null}

        {loading || !data ? (
          <p className="text-sm text-sage-600">
            {loading ? "Loading client data..." : "Client data unavailable."}
          </p>
        ) : (
          <div className="space-y-4">
            <BasicInfo data={data} locale={locale} />
            <SummaryGrid client={activity} locale={locale} />
            <ActionSection
              client={data}
              giftAmount={giftAmount}
              busy={busy}
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
      </div>
    </OmmDrawerPortal>
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


