import type { ClientTag } from "@/components/admin/admin-clients-types";

export const ADMIN_CLIENT_TAG_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]";

export function clientTagBadgeTone(tag: ClientTag): string {
  if (tag === "VIP") return "bg-amber-100 text-amber-900";
  if (tag === "New") return "bg-sky-100 text-sky-900";
  if (tag === "At Risk") return "bg-rose-100 text-rose-800";
  return "bg-violet-100 text-violet-900";
}

export function clientTagLabelKey(tag: ClientTag): string {
  if (tag === "VIP") return "tagVip";
  if (tag === "New") return "tagNew";
  if (tag === "At Risk") return "tagAtRisk";
  return "tagBeginner";
}
