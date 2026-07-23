import type { ClientTag } from "@/components/admin/admin-clients-types";

/** Avatar shell — isolates badge stacking above the image/initials layer. */
export const ADMIN_CLIENT_AVATAR_SIZE_CLASS = "h-12 w-12";

export const ADMIN_CLIENT_AVATAR_WRAPPER_CLASS =
  `relative isolate ${ADMIN_CLIENT_AVATAR_SIZE_CLASS} shrink-0 overflow-visible`;

export const ADMIN_CLIENT_AVATAR_LAYER_CLASS =
  `relative z-0 ${ADMIN_CLIENT_AVATAR_SIZE_CLASS}`;

/** Slanted ribbon on the top-left of the client avatar in list rows. */
export const ADMIN_CLIENT_TAG_OVERLAY_BADGE_CLASS =
  "pointer-events-none absolute -left-4 top-1 z-20 origin-top-left -rotate-[35deg] whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.05em] shadow-[0_2px_8px_rgba(15,23,42,0.2)] ring-2 ring-white";

export function clientTagBadgeTone(tag: ClientTag): string {
  if (tag === "VIP") return "bg-amber-100 text-amber-900";
  if (tag === "New") return "bg-sky-100 text-sky-900";
  return "bg-violet-100 text-violet-900";
}

export function clientTagLabelKey(tag: ClientTag): string {
  if (tag === "VIP") return "tagVip";
  if (tag === "New") return "tagNew";
  return "tagBeginner";
}
