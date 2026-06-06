import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, ContentType, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CONTENT_POST_DEFAULT_LOCALE,
  resolveContentPostLocale,
  type ContentPostLocale,
} from './content-locales';
import { ReviewDecision, ReviewPostDto } from './dto/review-post.dto';
import type { ContentPostTranslationDto } from './dto/content-post-translation.dto';
import type { UpsertPostDto } from './dto/upsert-post.dto';

type PublicContentPost = {
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

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: RedisCacheService,
  ) {}

  listPublished(type?: ContentType, localeInput?: string) {
    const locale = resolveContentPostLocale(localeInput);
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.contentPosts(type, locale),
      PUBLIC_CACHE_TTL_SEC.contentPosts,
      () => this.fetchPublishedPosts(type, locale),
    );
  }

  getBySlug(slug: string, localeInput?: string) {
    const locale = resolveContentPostLocale(localeInput);
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.contentPost(slug, locale),
      PUBLIC_CACHE_TTL_SEC.contentPost,
      () => this.fetchPublishedPostBySlug(slug, locale),
    );
  }

  listAdmin() {
    return this.prisma.contentPost.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 500,
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });
  }

  async create(dto: UpsertPostDto, actor: { id: string; role: Role }) {
    const translations = this.normalizeTranslations(dto.translations);
    const primary = this.resolvePrimaryTranslation(translations);
    const created = await this.prisma.contentPost.create({
      data: {
        type: dto.type,
        status: dto.status,
        slug: primary.slug,
        title: primary.title,
        excerpt: primary.excerpt,
        body: primary.body,
        seoTitle: primary.seoTitle,
        seoDescription: primary.seoDescription,
        authorName: dto.authorName,
        tags: this.sanitizeTags(dto.tags),
        editorialNotes: dto.editorialNotes,
        reviewNotes: dto.reviewNotes,
        reviewedById: dto.reviewedById,
        reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
        submittedForReviewAt: dto.submittedForReviewAt
          ? new Date(dto.submittedForReviewAt)
          : null,
        coverImageUrl: dto.coverImageUrl,
        publishedAt: this.resolvePublishedAt(dto),
        translations: {
          create: translations,
        },
      },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CONTENT_POST_CREATED',
      entityType: 'ContentPost',
      entityId: created.id,
      payload: { status: created.status },
    });
    await this.invalidatePublicContentCache();
    return created;
  }

  async update(
    id: string,
    dto: UpsertPostDto,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.contentPost.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException();
    }
    const translations = this.normalizeTranslations(dto.translations);
    const primary = this.resolvePrimaryTranslation(translations);
    const updated = await this.prisma.contentPost.update({
      where: { id },
      data: {
        type: dto.type,
        status: dto.status,
        slug: primary.slug,
        title: primary.title,
        excerpt: primary.excerpt,
        body: primary.body,
        seoTitle: primary.seoTitle,
        seoDescription: primary.seoDescription,
        authorName: dto.authorName,
        tags: this.sanitizeTags(dto.tags),
        editorialNotes: dto.editorialNotes,
        reviewNotes: dto.reviewNotes,
        reviewedById: dto.reviewedById,
        reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
        submittedForReviewAt: dto.submittedForReviewAt
          ? new Date(dto.submittedForReviewAt)
          : null,
        coverImageUrl: dto.coverImageUrl,
        publishedAt: this.resolvePublishedAt(dto, existing.publishedAt),
        translations: {
          deleteMany: {},
          create: translations,
        },
      },
      include: {
        translations: {
          orderBy: { locale: 'asc' },
        },
      },
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CONTENT_POST_UPDATED',
      entityType: 'ContentPost',
      entityId: id,
      payload: { status: updated.status },
    });
    await this.invalidatePublicContentCache();
    return updated;
  }

  async submitForReview(id: string, actor: { id: string; role: Role }) {
    const existing = await this.prisma.contentPost.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException();
    }
    if (existing.status === ContentStatus.PUBLISHED) {
      throw new BadRequestException(
        'Published post cannot be submitted for review',
      );
    }
    const now = new Date();
    const updated = await this.prisma.contentPost.update({
      where: { id },
      data: {
        status: ContentStatus.IN_REVIEW,
        submittedForReviewAt: now,
        reviewedAt: null,
        reviewedById: null,
        reviewNotes: null,
      },
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CONTENT_REVIEW_SUBMITTED',
      entityType: 'ContentPost',
      entityId: id,
      payload: { previousStatus: existing.status },
    });
    return updated;
  }

  async review(
    id: string,
    dto: ReviewPostDto,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.contentPost.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException();
    }
    if (existing.status !== ContentStatus.IN_REVIEW) {
      throw new BadRequestException('Post is not in review');
    }
    if (dto.decision === ReviewDecision.REJECT && !dto.note?.trim()) {
      throw new BadRequestException('Rejection note is required');
    }
    const now = new Date();
    const nextStatus =
      dto.decision === ReviewDecision.APPROVE
        ? ContentStatus.PUBLISHED
        : ContentStatus.REJECTED;
    const updated = await this.prisma.contentPost.update({
      where: { id },
      data: {
        status: nextStatus,
        reviewedById: actor.id,
        reviewedAt: now,
        reviewNotes: dto.note?.trim() || null,
        publishedAt:
          dto.decision === ReviewDecision.APPROVE
            ? (existing.publishedAt ?? now)
            : existing.publishedAt,
      },
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action:
        dto.decision === ReviewDecision.APPROVE
          ? 'CONTENT_REVIEW_APPROVED'
          : 'CONTENT_REVIEW_REJECTED',
      entityType: 'ContentPost',
      entityId: id,
      payload: { note: dto.note ?? null },
    });
    await this.invalidatePublicContentCache();
    return updated;
  }

  async delete(id: string) {
    await this.prisma.contentPost.delete({ where: { id } });
    await this.invalidatePublicContentCache();
    return { ok: true };
  }

  private async fetchPublishedPosts(
    type: ContentType | undefined,
    locale: ContentPostLocale,
  ): Promise<PublicContentPost[]> {
    const posts = await this.prisma.contentPost.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        ...(type && { type }),
      },
      include: {
        translations: {
          where: { locale },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return posts
      .map((post) => this.toPublicPost(post, locale))
      .filter((post): post is PublicContentPost => post !== null);
  }

  private async fetchPublishedPostBySlug(
    slug: string,
    locale: ContentPostLocale,
  ): Promise<PublicContentPost | null> {
    const translation = await this.prisma.contentPostTranslation.findFirst({
      where: {
        slug: slug.toLowerCase(),
        locale,
        post: { status: ContentStatus.PUBLISHED },
      },
      include: { post: true },
    });
    if (translation !== null) {
      return this.toPublicPost(
        { ...translation.post, translations: [translation] },
        locale,
      );
    }

    const legacy = await this.prisma.contentPost.findFirst({
      where: {
        slug: slug.toLowerCase(),
        status: ContentStatus.PUBLISHED,
      },
      include: {
        translations: {
          where: { locale },
        },
      },
    });
    if (legacy === null) {
      return null;
    }
    return this.toPublicPost(legacy, locale);
  }

  private toPublicPost(
    post: {
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

  private normalizeTranslations(
    translations: ContentPostTranslationDto[],
  ): Array<{
    locale: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }> {
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
        throw new BadRequestException(`Duplicate slug for locale ${translation.locale}`);
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
    const primary = this.resolvePrimaryTranslation(normalized);
    if (primary.title.length === 0) {
      throw new BadRequestException(
        `Title is required for locale ${CONTENT_POST_DEFAULT_LOCALE}`,
      );
    }
    return normalized;
  }

  private resolvePrimaryTranslation<
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

  private async invalidatePublicContentCache(): Promise<void> {
    await this.cache.invalidateByPrefix(PUBLIC_CACHE_KEYS.contentPrefix);
  }

  private resolvePublishedAt(
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

  private sanitizeTags(tags: string[] | undefined): string[] {
    if (!tags || tags.length === 0) {
      return [];
    }
    return tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag, index, arr) => tag.length > 0 && arr.indexOf(tag) === index)
      .slice(0, 12);
  }
}
