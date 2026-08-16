import type { CallTaskStatus } from "@/components/admin/admin-call-tasks-query";

export const ADMIN_CALL_TASK_STATUS_BADGE_CLASS =
  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide";

export function callTaskStatusBadgeTone(
  status: CallTaskStatus,
  isOverdue: boolean,
): string {
  if (status === "DONE") {
    return "bg-mint-100 text-sage-800";
  }
  if (status === "CANCELLED") {
    return "bg-sand-100 text-sage-600";
  }
  if (isOverdue) {
    return "bg-peach-100 text-sand-800";
  }
  return "bg-amber-100 text-amber-900";
}
