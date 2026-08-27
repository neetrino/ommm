import type { ClientTag } from "@/components/admin/admin-clients-types";

/** Avatar shell — isolates badge stacking above the image/initials layer. */
export const ADMIN_CLIENT_AVATAR_SIZE_CLASS = "h-12 w-12";

export const ADMIN_CLIENT_AVATAR_WRAPPER_CLASS =
  `relative isolate z-10 ${ADMIN_CLIENT_AVATAR_SIZE_CLASS} shrink-0 overflow-visible`;

export const ADMIN_CLIENT_AVATAR_LAYER_CLASS =
  `relative z-0 ${ADMIN_CLIENT_AVATAR_SIZE_CLASS}`;

const TAG_OVERLAY_BASE_CLASS =
  "pointer-events-none absolute z-50 origin-top-left whitespace-nowrap";

const DEFAULT_TAG_OVERLAY_TILT_CLASS = "-rotate-[18deg]";
const INFLUENCER_TAG_OVERLAY_TILT_CLASS = "-rotate-[12deg]";

/** Slanted ribbon on the top-left of the client avatar in list rows. */
export const ADMIN_CLIENT_TAG_OVERLAY_BADGE_CLASS =
  `${TAG_OVERLAY_BASE_CLASS} -left-0.5 top-0 ${DEFAULT_TAG_OVERLAY_TILT_CLASS} rounded-sm px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.05em] shadow-[0_2px_8px_rgba(15,23,42,0.2)] ring-2 ring-white`;

/** Champagne ribbon — softer tilt, gold edge, no heavy stamp shadow. */
export const ADMIN_CLIENT_INFLUENCER_OVERLAY_BADGE_CLASS =
  `${TAG_OVERLAY_BASE_CLASS} -left-1 top-0 ${INFLUENCER_TAG_OVERLAY_TILT_CLASS} rounded-full border border-gift-gold/60 bg-gradient-to-r from-peach-100 via-paper to-peach-100 px-2 py-0.5 font-serif text-[8px] font-medium uppercase tracking-[0.14em] text-sand-700 shadow-[0_1px_4px_rgba(107,92,76,0.12)]`;

export function clientTagBadgeTone(tag: ClientTag): string {
  if (tag === "VIP") return "bg-amber-100 text-amber-900";
  if (tag === "New") return "bg-sky-100 text-sky-900";
  if (tag === "Influencer") return "bg-peach-100 text-sand-700";
  return "bg-violet-100 text-violet-900";
}

export function clientTagOverlayBadgeClass(tag: ClientTag): string {
  if (tag === "Influencer") {
    return ADMIN_CLIENT_INFLUENCER_OVERLAY_BADGE_CLASS;
  }
  return `${ADMIN_CLIENT_TAG_OVERLAY_BADGE_CLASS} ${clientTagBadgeTone(tag)}`;
}

export function clientTagLabelKey(tag: ClientTag): string {
  if (tag === "VIP") return "tagVip";
  if (tag === "New") return "tagNew";
  if (tag === "Influencer") return "tagInfluencer";
  return "tagBeginner";
}
