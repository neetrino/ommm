import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, ContentType, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewDecision, ReviewPostDto } from './dto/review-post.dto';
import type { UpsertPostDto } from './dto/upsert-post.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listPublished(type?: ContentType) {
    return this.prisma.contentPost.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        ...(type && { type }),
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  getBySlug(slug: string) {
    return this.prisma.contentPost.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
  }

  listAdmin() {
    return this.prisma.contentPost.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });
  }

  async create(dto: UpsertPostDto, actor: { id: string; role: Role }) {
    const created = await this.prisma.contentPost.create({
      data: {
        type: dto.type,
        status: dto.status,
        slug: dto.slug.toLowerCase(),
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        authorName: dto.authorName,
        tags: this.sanitizeTags(dto.tags),
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        editorialNotes: dto.editorialNotes,
        reviewNotes: dto.reviewNotes,
        reviewedById: dto.reviewedById,
        reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
        submittedForReviewAt: dto.submittedForReviewAt
          ? new Date(dto.submittedForReviewAt)
          : null,
        coverImageUrl: dto.coverImageUrl,
        publishedAt: this.resolvePublishedAt(dto),
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
    const updated = await this.prisma.contentPost.update({
      where: { id },
      data: {
        type: dto.type,
        status: dto.status,
        slug: dto.slug.toLowerCase(),
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        authorName: dto.authorName,
        tags: this.sanitizeTags(dto.tags),
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        editorialNotes: dto.editorialNotes,
        reviewNotes: dto.reviewNotes,
        reviewedById: dto.reviewedById,
        reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
        submittedForReviewAt: dto.submittedForReviewAt
          ? new Date(dto.submittedForReviewAt)
          : null,
        coverImageUrl: dto.coverImageUrl,
        publishedAt: this.resolvePublishedAt(dto, existing.publishedAt),
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
    return updated;
  }

  async delete(id: string) {
    await this.prisma.contentPost.delete({ where: { id } });
    return { ok: true };
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
