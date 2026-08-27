import type {
  ContentPostStatus,
  ContentPostType,
} from "@/components/shared/content/content-post-types";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";

export const CONTENT_POST_TYPE_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]";

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

export function contentPostTypeBadgeClass(type: ContentPostType): string {
  return `${CONTENT_POST_TYPE_BADGE_CLASS} ${CONTENT_POST_TYPE_BADGE_TONES[type]}`;
}

export function contentPostStatusBadgeClass(status: ContentPostStatus): string {
  if (status === "PUBLISHED") {
    return "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800";
  }
  if (status === "IN_REVIEW") {
    return "inline-flex rounded-full border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs font-medium text-sage-900";
  }
  if (status === "DRAFT") {
    return "inline-flex rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-700";
  }
  if (status === "REJECTED") {
    return "inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700";
  }
  if (status === "HIDDEN") {
    return "inline-flex rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600";
  }
  return "inline-flex rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-700";
}

export function buildContentPostUpdatedDisplay(locale: string, updatedAt: string) {
  return buildSessionDateTimeDisplay(locale, updatedAt, updatedAt);
}
