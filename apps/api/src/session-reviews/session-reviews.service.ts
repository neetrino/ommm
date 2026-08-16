import {
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
import type { SubmitSessionReviewDto } from './dto/submit-session-review.dto';
import {
  toCoachInboxDto,
  toMemberPendingDto,
  toStaffInboxDto,
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
    const comment = dto.comment?.trim() ?? '';
    const updated = await this.prisma.sessionReview.update({
      where: { id: row.id },
      data: {
        status: SessionReviewStatus.SUBMITTED,
        rating: dto.rating,
        comment: comment.length > 0 ? comment : null,
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

  async listStaffInbox() {
    const rows = await this.prisma.sessionReview.findMany({
      where: { status: SessionReviewStatus.SUBMITTED },
      include: SESSION_INCLUDE,
      orderBy: [{ staffReadAt: 'asc' }, { submittedAt: 'desc' }],
      take: SESSION_REVIEW_INBOX_TAKE,
    });
    return { items: rows.map((row) => toStaffInboxDto(row)) };
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

  async listCoachInbox(userId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenException();
    }
    const rows = await this.prisma.sessionReview.findMany({
      where: {
        status: SessionReviewStatus.SUBMITTED,
        isAnonymous: false,
        coachProfileId: profile.id,
      },
      include: SESSION_INCLUDE,
      orderBy: { submittedAt: 'desc' },
      take: SESSION_REVIEW_INBOX_TAKE,
    });
    return { items: rows.map((row) => toCoachInboxDto(row)) };
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
