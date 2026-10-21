import { BadRequestException } from '@nestjs/common';
import { ContentStatus, ContentType } from '@prisma/client';
import {
  CONTENT_POST_DEFAULT_LOCALE,
  type ContentPostLocale,
} from './content-locales';
import type { ContentPostTranslationDto } from './dto/content-post-translation.dto';
import type { UpsertPostDto } from './dto/upsert-post.dto';

export type PublicContentPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  type: ContentType;
  publishedAt: Date | null;
  authorName: string | null;
  tags: string[];
  coverImageUrl: string | null;
};

export type NormalizedContentTranslation = {
  locale: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export function toPublicPost(
  post: {
    id: string;
    type: ContentType;
    publishedAt: Date | null;
    authorName: string | null;
    tags: string[];
    coverImageUrl: string | null;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string | null;
    translations: Array<{
      locale: string;
      slug: string;
      title: string;
      excerpt: string | null;
      body: string | null;
    }>;
  },
  locale: ContentPostLocale,
): PublicContentPost | null {
  const translation = post.translations.find((item) => item.locale === locale);
  const title = translation?.title?.trim() || post.title;
  if (title.trim().length === 0) {
    return null;
  }
  return {
    id: post.id,
    slug: translation?.slug ?? post.slug,
    title,
    excerpt: translation?.excerpt ?? post.excerpt,
    body: translation?.body ?? post.body,
    type: post.type,
    publishedAt: post.publishedAt,
    authorName: post.authorName,
    tags: post.tags,
    coverImageUrl: post.coverImageUrl,
  };
}

export function normalizeTranslations(
  translations: ContentPostTranslationDto[],
): NormalizedContentTranslation[] {
  const seenLocales = new Set<string>();
  const seenSlugs = new Set<string>();
  const normalized = translations.map((translation) => {
    if (seenLocales.has(translation.locale)) {
      throw new BadRequestException(
        `Duplicate translation locale: ${translation.locale}`,
      );
    }
    seenLocales.add(translation.locale);
    const slug = translation.slug.trim().toLowerCase();
    if (slug.length === 0) {
      throw new BadRequestException(
        `Slug is required for locale ${translation.locale}`,
      );
    }
    const slugKey = `${translation.locale}:${slug}`;
    if (seenSlugs.has(slugKey)) {
      throw new BadRequestException(
        `Duplicate slug for locale ${translation.locale}`,
      );
    }
    seenSlugs.add(slugKey);
    return {
      locale: translation.locale,
      slug,
      title: translation.title.trim(),
      excerpt: translation.excerpt?.trim() || null,
      body: translation.body?.trim() || null,
      seoTitle: translation.seoTitle?.trim() || null,
      seoDescription: translation.seoDescription?.trim() || null,
    };
  });
  const primary = resolvePrimaryTranslation(normalized);
  if (primary.title.length === 0) {
    throw new BadRequestException(
      `Title is required for locale ${CONTENT_POST_DEFAULT_LOCALE}`,
    );
  }
  return normalized;
}

export function resolvePrimaryTranslation<
  T extends { locale: string; slug: string; title: string },
>(translations: readonly T[]): T {
  const preferred = translations.find(
    (translation) => translation.locale === CONTENT_POST_DEFAULT_LOCALE,
  );
  if (preferred !== undefined) {
    return preferred;
  }
  const first = translations[0];
  if (first === undefined) {
    throw new BadRequestException('At least one translation is required');
  }
  return first;
}

export function resolvePublishedAt(
  dto: UpsertPostDto,
  existingPublishedAt?: Date | null,
): Date | null {
  if (dto.publishedAt) {
    return new Date(dto.publishedAt);
  }
  if (dto.status === ContentStatus.PUBLISHED) {
    return existingPublishedAt ?? new Date();
  }
  return null;
}

export function contentPostUpdateData(
  dto: UpsertPostDto,
  primary: NormalizedContentTranslation,
  existing: { coverImageUrl: string | null; publishedAt: Date | null },
) {
  return {
    type: dto.type,
    status: dto.status,
    slug: primary.slug,
    title: primary.title,
    excerpt: primary.excerpt,
    body: primary.body,
    seoTitle: primary.seoTitle,
    seoDescription: primary.seoDescription,
    authorName: dto.authorName,
    tags: sanitizeTags(dto.tags),
    editorialNotes: dto.editorialNotes,
    reviewNotes: dto.reviewNotes,
    reviewedById: dto.reviewedById,
    reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
    submittedForReviewAt: dto.submittedForReviewAt
      ? new Date(dto.submittedForReviewAt)
      : null,
    coverImageUrl:
      dto.coverImageUrl !== undefined
        ? (dto.coverImageUrl ?? null)
        : existing.coverImageUrl,
    publishedAt: resolvePublishedAt(dto, existing.publishedAt),
  };
}

export function sanitizeTags(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) {
    return [];
  }
  return tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag, index, arr) => tag.length > 0 && arr.indexOf(tag) === index)
    .slice(0, 12);
}
