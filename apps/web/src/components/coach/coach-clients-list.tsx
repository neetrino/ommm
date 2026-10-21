"use client";

import { useTranslations } from "next-intl";
import {
  coachClientDisplayName,
  type CoachPanelClient,
} from "@/components/coach/coach-clients-types";
import { formatDateTimeForUi } from "@/lib/date-display";

const CLIENT_ROW_CLASS = [
  "flex w-full items-center justify-between gap-3 rounded-2xl",
  "border border-white/70 bg-white/70 px-4 py-3 text-left",
  "shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)]",
  "transition hover:bg-white",
].join(" ");

type CoachClientsListProps = {
  clients: readonly CoachPanelClient[];
  locale: string;
  onSelect: (client: CoachPanelClient) => void;
};

export function CoachClientsList({ clients, locale, onSelect }: CoachClientsListProps) {
  const t = useTranslations("coachPages.clients");

  return (
    <ul className="space-y-2">
      {clients.map((client) => (
        <li key={client.id}>
          <CoachClientRow client={client} locale={locale} onSelect={onSelect} label={t} />
        </li>
      ))}
    </ul>
  );
}

function CoachClientRow({
  client,
  locale,
  onSelect,
  label,
}: {
  client: CoachPanelClient;
  locale: string;
  onSelect: (client: CoachPanelClient) => void;
  label: ReturnType<typeof useTranslations<"coachPages.clients">>;
}) {
  const name = coachClientDisplayName(client, label("unnamed"));
  const when =
    client.lastSessionAt === null
      ? null
      : formatDateTimeForUi(client.lastSessionAt, locale);

  return (
    <button type="button" className={CLIENT_ROW_CLASS} onClick={() => onSelect(client)}>
      <span className="min-w-0">
        <span className="block truncate font-medium text-sage-900">{name}</span>
        {when !== null ? (
          <span className="mt-0.5 block truncate text-xs text-sage-600">
            {label("lastSession", { when })}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-xs text-sage-600">
        {label("bookingCount", { count: client.bookingCount })}
      </span>
    </button>
  );
}
