export const CONTENT_POST_TYPES = [
  "EVENT",
  "BLOG",
  "NEWS",
  "UPDATE",
  "KNOWLEDGE_ARTICLE",
] as const;

export const CONTENT_POST_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "REJECTED",
  "PUBLISHED",
  "HIDDEN",
] as const;

export type ContentPostType = (typeof CONTENT_POST_TYPES)[number];
export type ContentPostStatus = (typeof CONTENT_POST_STATUSES)[number];

export type ContentPostRow = {
  id: string;
  slug: string;
  title: string;
  type: ContentPostType;
  status: ContentPostStatus;
  excerpt?: string | null;
  body?: string | null;
  authorName?: string | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  editorialNotes?: string | null;
  reviewNotes?: string | null;
  submittedForReviewAt?: string | null;
  reviewedAt?: string | null;
  updatedAt: string;
};

export type ContentPostFormValues = {
  title: string;
  slug: string;
  type: ContentPostType;
  status: ContentPostStatus;
  body: string;
  authorName: string;
  tagsCsv: string;
  seoTitle: string;
  seoDescription: string;
  editorialNotes: string;
};

export function emptyContentPostFormValues(): ContentPostFormValues {
  return {
    title: "",
    slug: "",
    type: "BLOG",
    status: "DRAFT",
    body: "",
    authorName: "",
    tagsCsv: "",
    seoTitle: "",
    seoDescription: "",
    editorialNotes: "",
  };
}

export function contentPostFormValuesFromRow(row: ContentPostRow): ContentPostFormValues {
  return {
    title: row.title,
    slug: row.slug,
    type: row.type,
    status: row.status,
    body: row.body ?? "",
    authorName: row.authorName ?? "",
    tagsCsv: row.tags?.join(", ") ?? "",
    seoTitle: row.seoTitle ?? "",
    seoDescription: row.seoDescription ?? "",
    editorialNotes: row.editorialNotes ?? "",
  };
}

export function parseContentPostTags(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index);
}

export function contentPostFormPayload(values: ContentPostFormValues): Record<string, unknown> {
  return {
    title: values.title,
    slug: values.slug,
    type: values.type,
    status: values.status,
    body: values.body,
    authorName: values.authorName.trim().length > 0 ? values.authorName.trim() : undefined,
    tags: parseContentPostTags(values.tagsCsv),
    seoTitle: values.seoTitle.trim().length > 0 ? values.seoTitle.trim() : undefined,
    seoDescription:
      values.seoDescription.trim().length > 0 ? values.seoDescription.trim() : undefined,
    editorialNotes:
      values.editorialNotes.trim().length > 0 ? values.editorialNotes.trim() : undefined,
  };
}
