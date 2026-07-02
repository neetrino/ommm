import { Injectable } from '@nestjs/common';
import { ContentStatus, ContentType } from '@prisma/client';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  resolveContentPostLocale,
  type ContentPostLocale,
} from './content-locales';
import { toPublicPost, type PublicContentPost } from './content-post.helpers';

@Injectable()
export class ContentPublicService {
  constructor(
    private readonly prisma: PrismaService,
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

  async invalidatePublicContentCache(): Promise<void> {
    await this.cache.invalidateByPrefix(PUBLIC_CACHE_KEYS.contentPrefix);
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
      .map((post) => toPublicPost(post, locale))
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
      return toPublicPost(
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
    return toPublicPost(legacy, locale);
  }
}
