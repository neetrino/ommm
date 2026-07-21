"use client";

import { useTranslations } from "next-intl";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";
import { apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { parseAmdMoneyInput } from "@/lib/price-amd";
import type { ClientDetail } from "./admin-clients-types";

type RunAction = (key: string, action: () => Promise<void>, ok: string) => Promise<void>;

export function ClientGiftActionPanel(props: {
  client: Pick<ClientDetail, "email" | "name" | "lastName">;
  giftAmount: string;
  busy: string | null;
  onGiftAmountChange: (value: string) => void;
  onRun: RunAction;
}) {
  const t = useTranslations("adminPages.clients");

  return (
    <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <p className="font-medium text-sage-900">{t("drawer.giveGift")}</p>
      <div className="mt-3 flex gap-2">
        <AmdMoneyInput
          className="h-10 flex-1"
          value={props.giftAmount}
          onValueChange={props.onGiftAmountChange}
          aria-label={t("drawer.giftAmountAria")}
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
                    amountCents: parseAmdMoneyInput(props.giftAmount) ?? 0,
                    recipientEmail: props.client.email,
                    recipientName: clientDisplayName(props.client),
                  }),
                }),
              t("drawer.giftCreated"),
            )
          }
        >
          {t("drawer.giveGiftButton")}
        </OmmButton>
      </div>
    </section>
  );
}

export function ClientHistoryList(props: {
  title: string;
  empty: string;
  items: Array<{ id: string; main: string; meta: string; extra: string | null }>;
}) {
  return (
    <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <p className="font-medium text-sage-900">{props.title}</p>
      <div className="mt-2 space-y-2">
        {props.items.length === 0 ? (
          <p className="text-sm text-sage-500">{props.empty}</p>
        ) : null}
        {props.items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/70 bg-white/65 px-3 py-2 text-sm"
          >
            <p className="font-medium text-sage-900">{item.main}</p>
            <p className="text-xs text-sage-600">{item.meta}</p>
            {item.extra ? <p className="mt-1 text-xs text-sage-500">{item.extra}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClientNotesPanel(props: {
  notes: ClientDetail["notes"];
  note: string;
  busy: boolean;
  onNoteChange: (value: string) => void;
  onAdd: () => void;
  canAddNotes?: boolean;
}) {
  const t = useTranslations("adminPages.clients");
  const canAdd = props.canAddNotes ?? true;

  return (
    <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <p className="font-medium text-sage-900">{t("noteLabel")}</p>
      {canAdd ? (
        <div className="mt-2 flex gap-2">
          <input
            className="ommm-input h-10 flex-1"
            value={props.note}
            onChange={(event) => props.onNoteChange(event.target.value)}
            placeholder={t("notePlaceholder")}
          />
          <OmmButton
            size="sm"
            disabled={props.busy || props.note.trim() === ""}
            onClick={props.onAdd}
          >
            {t("addNote")}
          </OmmButton>
        </div>
      ) : null}
      <div className="mt-3 space-y-2">
        {props.notes.length === 0 ? (
          <p className="text-sm text-sage-500">{t("drawer.noNotes")}</p>
        ) : null}
        {props.notes.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm"
          >
            <p className="text-sage-800">{entry.body}</p>
            <p className="mt-1 text-xs text-sage-500">
              {entry.author.name ?? entry.author.email} · {formatDateForUi(entry.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function clientDisplayName(client: { name: string | null; lastName: string | null; email: string }) {
  return [client.name, client.lastName].filter(Boolean).join(" ").trim() || client.email;
}
