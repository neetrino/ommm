"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ADMIN_CALL_TASK_STATUS_BADGE_CLASS,
  callTaskStatusBadgeTone,
} from "@/components/admin/admin-call-tasks-list-badges";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { displayPhoneOrFallback } from "@/lib/phone";
import { STUDIO_TIMEZONE } from "@/lib/studio-timezone";
import { ADMIN_CARD_CONTAIN_CLASS } from "@/components/admin/admin-list-table-layout";

type AdminCallTasksCardProps = {
  row: CallTaskRow;
  onOpenDetails: () => void;
};

export function AdminCallTasksCard({ row, onOpenDetails }: AdminCallTasksCardProps) {
  const locale = useLocale();
  const t = useTranslations("adminPages.calls");
  const pending = row.status === "PENDING";
  const statusLabel = row.isOverdue && pending ? t("overdue") : t(`status.${row.status}`);
  const dueLabel = formatCallDueWhen(locale, row.dueOnDate);

  return (
    <button
      type="button"
      onClick={onOpenDetails}
      aria-label={t("viewDetailsFor", { name: row.contactName })}
      className={`${ADMIN_CARD_CONTAIN_CLASS} w-full rounded-2xl border border-sand-200/80 bg-white/90 p-5 text-left shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)] transition-[border-color,box-shadow,transform] hover:border-sand-300 hover:shadow-[0_16px_32px_-20px_rgba(45,40,35,0.28)] active:scale-[0.995]`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">{dueLabel}</p>
      <h2 className="mt-1 truncate font-serif text-xl text-sage-900">{row.contactName}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-sage-700">
        <span>{displayPhoneOrFallback(row.phone)}</span>
        <span
          className={`${ADMIN_CALL_TASK_STATUS_BADGE_CLASS} ${callTaskStatusBadgeTone(row.status, row.isOverdue)}`}
        >
          {statusLabel}
        </span>
      </div>
      {row.comment.trim().length > 0 ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sage-800">{row.comment}</p>
      ) : (
        <p className="mt-3 text-sm italic text-sage-500">{t("noComment")}</p>
      )}
    </button>
  );
}

function formatCallDueWhen(locale: string, dueOnDate: string): string {
  const date = new Date(`${dueOnDate}T12:00:00.000Z`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: STUDIO_TIMEZONE,
  }).format(date);
}
