export const CONTENT_POST_LOCALES = ["hy", "ru", "en"] as const;

export type ContentPostLocale = (typeof CONTENT_POST_LOCALES)[number];

export const CONTENT_POST_DEFAULT_LOCALE: ContentPostLocale = "en";

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

export type ContentPostLocaleFormValues = {
  title: string;
  slug: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
};

export type ContentPostTranslationRow = {
  locale: ContentPostLocale;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

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
  translations?: ContentPostTranslationRow[];
};

export type ContentPostFormValues = {
  type: ContentPostType;
  status: ContentPostStatus;
  authorName: string;
  tagsCsv: string;
  editorialNotes: string;
  locales: Record<ContentPostLocale, ContentPostLocaleFormValues>;
};

function emptyLocaleFormValues(): ContentPostLocaleFormValues {
  return {
    title: "",
    slug: "",
    body: "",
    seoTitle: "",
    seoDescription: "",
  };
}

export function emptyContentPostFormValues(): ContentPostFormValues {
  return {
    type: "BLOG",
    status: "DRAFT",
    authorName: "",
    tagsCsv: "",
    editorialNotes: "",
    locales: {
      hy: emptyLocaleFormValues(),
      ru: emptyLocaleFormValues(),
      en: emptyLocaleFormValues(),
    },
  };
}

function localeValuesFromTranslation(
  translation: ContentPostTranslationRow | undefined,
  fallback?: Partial<ContentPostLocaleFormValues>,
): ContentPostLocaleFormValues {
  if (translation === undefined) {
    return {
      title: fallback?.title ?? "",
      slug: fallback?.slug ?? "",
      body: fallback?.body ?? "",
      seoTitle: fallback?.seoTitle ?? "",
      seoDescription: fallback?.seoDescription ?? "",
    };
  }
  return {
    title: translation.title ?? "",
    slug: translation.slug ?? "",
    body: translation.body ?? "",
    seoTitle: translation.seoTitle ?? "",
    seoDescription: translation.seoDescription ?? "",
  };
}

export function contentPostFormValuesFromRow(row: ContentPostRow): ContentPostFormValues {
  const byLocale = new Map(
    (row.translations ?? []).map((translation) => [translation.locale, translation]),
  );
  const englishFallback = {
    title: row.title,
    slug: row.slug,
    body: row.body ?? "",
    seoTitle: row.seoTitle ?? "",
    seoDescription: row.seoDescription ?? "",
  };

  return {
    type: row.type,
    status: row.status,
    authorName: row.authorName ?? "",
    tagsCsv: row.tags?.join(", ") ?? "",
    editorialNotes: row.editorialNotes ?? "",
    locales: {
      hy: localeValuesFromTranslation(byLocale.get("hy")),
      ru: localeValuesFromTranslation(byLocale.get("ru")),
      en: localeValuesFromTranslation(byLocale.get("en"), englishFallback),
    },
  };
}

export function parseContentPostTags(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index);
}

function resolveLocaleSlug(
  locale: ContentPostLocale,
  localeValues: ContentPostLocaleFormValues,
  englishSlug: string,
): string {
  const trimmed = localeValues.slug.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  if (locale === CONTENT_POST_DEFAULT_LOCALE) {
    return englishSlug;
  }
  if (englishSlug.length === 0) {
    return "";
  }
  return `${englishSlug}-${locale}`;
}

export function contentPostFormPayload(values: ContentPostFormValues): Record<string, unknown> {
  const englishSlug = values.locales.en.slug.trim().toLowerCase();
  const translations = CONTENT_POST_LOCALES.map((locale) => {
    const localeValues = values.locales[locale];
    return {
      locale,
      slug: resolveLocaleSlug(locale, localeValues, englishSlug).toLowerCase(),
      title: localeValues.title.trim(),
      body: localeValues.body.trim().length > 0 ? localeValues.body.trim() : undefined,
      seoTitle: localeValues.seoTitle.trim().length > 0 ? localeValues.seoTitle.trim() : undefined,
      seoDescription:
        localeValues.seoDescription.trim().length > 0
          ? localeValues.seoDescription.trim()
          : undefined,
    };
  });

  return {
    type: values.type,
    status: values.status,
    authorName: values.authorName.trim().length > 0 ? values.authorName.trim() : undefined,
    tags: parseContentPostTags(values.tagsCsv),
    editorialNotes:
      values.editorialNotes.trim().length > 0 ? values.editorialNotes.trim() : undefined,
    translations,
  };
}

export function updateContentPostLocaleField(
  values: ContentPostFormValues,
  locale: ContentPostLocale,
  key: keyof ContentPostLocaleFormValues,
  value: string,
): ContentPostFormValues {
  return {
    ...values,
    locales: {
      ...values.locales,
      [locale]: {
        ...values.locales[locale],
        [key]: value,
      },
    },
  };
}

export function hasContentPostLocaleDraft(values: ContentPostLocaleFormValues): boolean {
  return (
    values.title.trim().length > 0 ||
    values.slug.trim().length > 0 ||
    values.body.trim().length > 0 ||
    values.seoTitle.trim().length > 0 ||
    values.seoDescription.trim().length > 0
  );
}
