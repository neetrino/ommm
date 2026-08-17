import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, SessionReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SESSION_REVIEW_INBOX_TAKE,
  SESSION_REVIEW_PENDING_TAKE,
  SESSION_REVIEW_PROMPT_TTL_DAYS,
} from './session-reviews.constants';
import type { ListSessionReviewsInboxQueryDto } from './dto/list-session-reviews-inbox-query.dto';
import type { SubmitSessionReviewDto } from './dto/submit-session-review.dto';
import {
  buildCoachInboxWhere,
  buildStaffInboxWhere,
} from './session-reviews-inbox-where';
import {
  toCoachInboxDto,
  toMemberPendingDto,
  toStaffInboxDto,
  formatPersonName,
} from './session-reviews.mapper';

const SESSION_INCLUDE = {
  session: {
    include: {
      classType: { select: { name: true } },
      coach: {
        include: {
          user: { select: { name: true, lastName: true } },
        },
      },
    },
  },
  author: { select: { id: true, name: true, lastName: true, email: true } },
} as const;

@Injectable()
export class SessionReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPendingForUser(userId: string) {
    const now = new Date();
    await this.expireStalePending(now);
    await this.ensurePendingForCompletedBookings(userId, now);
    const rows = await this.prisma.sessionReview.findMany({
      where: { authorUserId: userId, status: SessionReviewStatus.PENDING },
      include: SESSION_INCLUDE,
      orderBy: { promptedAt: 'desc' },
      take: SESSION_REVIEW_PENDING_TAKE,
    });
    return { items: rows.map((row) => toMemberPendingDto(row)) };
  }

  async submit(userId: string, id: string, dto: SubmitSessionReviewDto) {
    const row = await this.requireOwnedPending(userId, id);
    const comment = dto.comment.trim();
    if (comment.length === 0) {
      throw new BadRequestException('Comment is required');
    }
    const updated = await this.prisma.sessionReview.update({
      where: { id: row.id },
      data: {
        status: SessionReviewStatus.SUBMITTED,
        rating: dto.rating,
        comment,
        isAnonymous: dto.isAnonymous,
        submittedAt: new Date(),
      },
      include: SESSION_INCLUDE,
    });
    return toMemberPendingDto(updated);
  }

  async dismiss(userId: string, id: string) {
    const row = await this.requireOwnedPending(userId, id);
    await this.prisma.sessionReview.update({
      where: { id: row.id },
      data: { status: SessionReviewStatus.DISMISSED },
    });
    return { ok: true as const };
  }

  async listStaffInbox(query: ListSessionReviewsInboxQueryDto) {
    const offset = query.offset ?? 0;
    const take = query.take ?? SESSION_REVIEW_INBOX_TAKE;
    const where = buildStaffInboxWhere(query);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.sessionReview.count({ where }),
      this.prisma.sessionReview.findMany({
        where,
        include: SESSION_INCLUDE,
        orderBy: [{ staffReadAt: 'asc' }, { submittedAt: 'desc' }],
        skip: offset,
        take,
      }),
    ]);
    return {
      items: rows.map((row) => toStaffInboxDto(row)),
      total,
      take,
      offset,
    };
  }

  async listFilterOptions() {
    const [coaches, packages] = await Promise.all([
      this.prisma.coachProfile.findMany({
        select: {
          id: true,
          user: { select: { name: true, lastName: true } },
        },
        orderBy: [{ user: { name: 'asc' } }, { user: { lastName: 'asc' } }],
      }),
      this.prisma.packagePlan.findMany({
        select: { id: true, name: true, categoryName: true },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      }),
    ]);
    return {
      coaches: coaches.map((row) => ({
        id: row.id,
        name: formatPersonName(row.user.name, row.user.lastName) || row.id,
      })),
      packages: packages.map((row) => ({
        id: row.id,
        name:
          row.categoryName.length > 0
            ? `${row.categoryName} · ${row.name}`
            : row.name,
      })),
    };
  }

  async unreadStaffCount() {
    const count = await this.prisma.sessionReview.count({
      where: { status: SessionReviewStatus.SUBMITTED, staffReadAt: null },
    });
    return { count };
  }

  async markStaffInboxRead() {
    await this.prisma.sessionReview.updateMany({
      where: { status: SessionReviewStatus.SUBMITTED, staffReadAt: null },
      data: { staffReadAt: new Date() },
    });
    return { ok: true as const };
  }

  async listCoachInbox(userId: string, query: ListSessionReviewsInboxQueryDto) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenException();
    }
    const offset = query.offset ?? 0;
    const take = query.take ?? SESSION_REVIEW_INBOX_TAKE;
    const where = buildCoachInboxWhere(profile.id, query);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.sessionReview.count({ where }),
      this.prisma.sessionReview.findMany({
        where,
        include: SESSION_INCLUDE,
        orderBy: { submittedAt: 'desc' },
        skip: offset,
        take,
      }),
    ]);
    return {
      items: rows.map((row) => toCoachInboxDto(row)),
      total,
      take,
      offset,
    };
  }

  private async requireOwnedPending(userId: string, id: string) {
    const row = await this.prisma.sessionReview.findUnique({ where: { id } });
    if (!row || row.authorUserId !== userId) {
      throw new NotFoundException();
    }
    if (row.status !== SessionReviewStatus.PENDING) {
      throw new ForbiddenException();
    }
    return row;
  }

  private async expireStalePending(now: Date): Promise<void> {
    const cutoff = new Date(
      now.getTime() - SESSION_REVIEW_PROMPT_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.prisma.sessionReview.updateMany({
      where: {
        status: SessionReviewStatus.PENDING,
        promptedAt: { lt: cutoff },
      },
      data: { status: SessionReviewStatus.EXPIRED },
    });
  }

  private async ensurePendingForCompletedBookings(
    userId: string,
    now: Date,
  ): Promise<void> {
    const cutoff = new Date(
      now.getTime() - SESSION_REVIEW_PROMPT_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.COMPLETED,
        sessionReview: null,
        session: { endsAt: { lte: now, gte: cutoff } },
      },
      include: { session: { select: { id: true, coachId: true, substituteCoachId: true } } },
      take: SESSION_REVIEW_PENDING_TAKE,
    });
    if (bookings.length === 0) {
      return;
    }
    await this.prisma.sessionReview.createMany({
      data: bookings.map((booking) => ({
        bookingId: booking.id,
        authorUserId: userId,
        sessionId: booking.session.id,
        coachProfileId: booking.session.substituteCoachId ?? booking.session.coachId,
      })),
      skipDuplicates: true,
    });
  }
}
