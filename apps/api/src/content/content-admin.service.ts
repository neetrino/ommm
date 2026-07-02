import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  normalizeTranslations,
  resolvePrimaryTranslation,
  resolvePublishedAt,
  sanitizeTags,
} from './content-post.helpers';
import { ContentPublicService } from './content-public.service';
import { ReviewDecision, ReviewPostDto } from './dto/review-post.dto';
import type { UpsertPostDto } from './dto/upsert-post.dto';

@Injectable()
export class ContentAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly publicContent: ContentPublicService,
  ) {}

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
    const translations = normalizeTranslations(dto.translations);
    const primary = resolvePrimaryTranslation(translations);
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
        tags: sanitizeTags(dto.tags),
        editorialNotes: dto.editorialNotes,
        reviewNotes: dto.reviewNotes,
        reviewedById: dto.reviewedById,
        reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
        submittedForReviewAt: dto.submittedForReviewAt
          ? new Date(dto.submittedForReviewAt)
          : null,
        coverImageUrl: dto.coverImageUrl ?? null,
        publishedAt: resolvePublishedAt(dto),
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
    await this.publicContent.invalidatePublicContentCache();
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
    const translations = normalizeTranslations(dto.translations);
    const primary = resolvePrimaryTranslation(translations);
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
    await this.publicContent.invalidatePublicContentCache();
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
    await this.publicContent.invalidatePublicContentCache();
    return updated;
  }

  async delete(id: string) {
    await this.prisma.contentPost.delete({ where: { id } });
    await this.publicContent.invalidatePublicContentCache();
    return { ok: true };
  }
}
