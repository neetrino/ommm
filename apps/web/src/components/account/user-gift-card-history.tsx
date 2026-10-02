"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

const SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)]";

const HIDDEN_MEMBER_KIND = "ISSUE";

const VISIBLE_KINDS = ["REDEEM", "SPEND", "REFUND", "ADJUST", "EXPIRE"] as const;

type GiftCardHistoryRow = {
  id: string;
  kind: string;
  code: string;
  amountAmd: number;
  classes: number;
  createdAt: string;
};

type HistoryLabels = {
  kind: (kind: string) => string;
  classes: (count: number) => string;
};

type UserGiftCardHistoryProps = {
  code: string;
  locale: string;
};

/** Per-card story shown inside the gift card sheet. Issued rows stay hidden. */
export function UserGiftCardHistory({ code, locale }: UserGiftCardHistoryProps) {
  const t = useTranslations("userPages.giftCards");
  const rows = useCardHistory(code);
  if (rows.length === 0) {
    return null;
  }
  const labels: HistoryLabels = {
    kind: (kind) => kindLabel(t, kind),
    classes: (count) => t("classGiftValueUnknown", { count }),
  };
  return (
    <section className={`${SECTION_CLASS} p-4 sm:p-5`}>
      <h3 className="text-sm font-semibold text-sage-900">{t("cardHistory")}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="text-sm text-sage-800">
            {historyLine(row, locale, labels)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function useCardHistory(code: string): GiftCardHistoryRow[] {
  const [rows, setRows] = useState<GiftCardHistoryRow[]>([]);
  useEffect(() => {
    let cancelled = false;
    void apiFetch<unknown>("/gift-cards/me/activity")
      .then((data) => {
        if (!cancelled) {
          setRows(readHistoryRows(data, code));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code]);
  return rows;
}

function readHistoryRows(value: unknown, code: string): GiftCardHistoryRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows = value.flatMap((item) => {
    const row = readHistoryRow(item);
    if (row === null || row.code !== code || row.kind === HIDDEN_MEMBER_KIND) {
      return [];
    }
    return [row];
  });
  return rows.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function readHistoryRow(value: unknown): GiftCardHistoryRow | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.kind !== "string" ||
    typeof row.code !== "string" ||
    typeof row.amountAmd !== "number" ||
    typeof row.classes !== "number" ||
    typeof row.createdAt !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    kind: row.kind,
    code: row.code,
    amountAmd: row.amountAmd,
    classes: row.classes,
    createdAt: row.createdAt,
  };
}

function historyLine(row: GiftCardHistoryRow, locale: string, labels: HistoryLabels): string {
  const parts = [labels.kind(row.kind), movementText(row, locale, labels.classes)].filter(
    (part) => part.length > 0,
  );
  const when = formatDateTimeForUi(row.createdAt, locale);
  if (when.length > 0) {
    parts.push(when);
  }
  return parts.join(" · ");
}

function movementText(
  row: GiftCardHistoryRow,
  locale: string,
  classesLabel: (count: number) => string,
): string {
  if (row.classes > 0) {
    return classesLabel(row.classes);
  }
  if (row.amountAmd > 0) {
    return formatAmdFromCents(row.amountAmd, locale);
  }
  return "";
}

function kindLabel(
  t: ReturnType<typeof useTranslations<"userPages.giftCards">>,
  kind: string,
): string {
  if (!isVisibleKind(kind)) {
    return kind;
  }
  return t(`activityKinds.${kind}`);
}

function isVisibleKind(kind: string): kind is (typeof VISIBLE_KINDS)[number] {
  return (VISIBLE_KINDS as readonly string[]).includes(kind);
}
