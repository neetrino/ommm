import { getTranslations } from "next-intl/server";
import { memberChrome } from "@/components/account/member-chrome";
import { formatAmdFromCents } from "@/lib/price-amd";

export type GiftCardActivityRow = {
  id: string;
  kind: string;
  code: string;
  amountAmd: number;
  classes: number;
  balanceAmdAfter: number;
  balanceClassesAfter: number;
  createdAt: string;
};

const ACTIVITY_KINDS = ["ISSUE", "REDEEM", "SPEND", "REFUND", "ADJUST", "EXPIRE"] as const;

type GiftCardActivityListProps = {
  locale: string;
  rows: GiftCardActivityRow[];
};

/** Ledger rows for cards this member issued or activated. */
export async function GiftCardActivityList({ locale, rows }: GiftCardActivityListProps) {
  const t = await getTranslations({ locale, namespace: "userPages.giftCards" });
  if (rows.length === 0) {
    return null;
  }
  return (
    <section className={`${memberChrome.surface} ${memberChrome.surfacePad} space-y-3`}>
      <h2 className={memberChrome.cardTitle}>{t("activityTitle")}</h2>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start justify-between gap-3 text-sm text-sage-800">
            <span>
              <span className="font-medium">{kindLabel(t, row.kind)}</span>
              <span className="mt-0.5 block font-mono text-xs text-sage-500">{row.code}</span>
            </span>
            <span className="text-right">
              <span className="block">{movementLabel(row, locale)}</span>
              <span className="block text-xs text-sage-500">{formatWhen(row.createdAt, locale)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function kindLabel(
  t: Awaited<ReturnType<typeof getTranslations>>,
  kind: string,
): string {
  if (isActivityKind(kind)) {
    return t(`activityKinds.${kind}`);
  }
  return kind;
}

function isActivityKind(kind: string): kind is (typeof ACTIVITY_KINDS)[number] {
  return (ACTIVITY_KINDS as readonly string[]).includes(kind);
}

function movementLabel(row: GiftCardActivityRow, locale: string): string {
  if (row.classes > 0) {
    return `${row.classes} · ${row.balanceClassesAfter}`;
  }
  return `${formatAmdFromCents(row.amountAmd, locale)} · ${formatAmdFromCents(row.balanceAmdAfter, locale)}`;
}

function formatWhen(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
