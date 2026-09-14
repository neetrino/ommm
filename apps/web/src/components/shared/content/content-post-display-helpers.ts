import type {
  ContentPostStatus,
  ContentPostType,
} from "@/components/shared/content/content-post-types";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";

/** Shared Type / Status pill size on list cards. */
export const CONTENT_POST_BADGE_CLASS =
  "inline-flex h-7 max-w-full shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold leading-none tracking-[0.06em]";

export const CONTENT_POST_TYPE_BADGE_CLASS = `${CONTENT_POST_BADGE_CLASS} uppercase`;

export const CONTENT_POST_TITLE_FONT_CLASS = "font-serif font-normal text-sage-900";

export const CONTENT_POST_LIST_TITLE_CLASS = [
  CONTENT_POST_TITLE_FONT_CLASS,
  "block w-full min-w-0 text-left text-xl leading-snug tracking-tight underline-offset-2 hover:underline",
].join(" ");

const CONTENT_POST_TYPE_BADGE_TONES: Record<ContentPostType, string> = {
  EVENT: "bg-sky-100 text-sky-900",
  BLOG: "bg-violet-100 text-violet-900",
  NEWS: "bg-amber-100 text-amber-900",
  UPDATE: "bg-rose-100 text-rose-800",
  KNOWLEDGE_ARTICLE: "bg-mint-100 text-sage-800",
};

const CONTENT_POST_STATUS_BADGE_TONES: Record<ContentPostStatus, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  IN_REVIEW: "border border-sand-200 bg-sand-50 text-sage-900",
  DRAFT: "border border-sage-200 bg-sage-50 text-sage-700",
  REJECTED: "border border-red-200 bg-red-50 text-red-700",
  HIDDEN: "border border-sage-200 bg-sage-50 text-sage-600",
};

export function contentPostTypeBadgeClass(type: ContentPostType): string {
  return `${CONTENT_POST_TYPE_BADGE_CLASS} ${CONTENT_POST_TYPE_BADGE_TONES[type]}`;
}

export function contentPostStatusBadgeClass(status: ContentPostStatus): string {
  return `${CONTENT_POST_BADGE_CLASS} ${CONTENT_POST_STATUS_BADGE_TONES[status]}`;
}

export function buildContentPostUpdatedDisplay(locale: string, updatedAt: string) {
  return buildSessionDateTimeDisplay(locale, updatedAt, updatedAt);
}
