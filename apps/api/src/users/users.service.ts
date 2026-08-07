import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Express } from 'express';
import { Prisma, BookingStatus, Role } from '@prisma/client';
import { sanitizeUser } from '../auth/auth.service';
import { GOOGLE_PROVIDER } from '../auth/google-oauth.types';
import { hashPassword, verifyPassword } from '../common/password-crypto';
import { isAppUiLocale } from '../common/app-ui-locales';
import { normalizeOptionalPhone } from '../common/phone';
import { PrismaService } from '../prisma/prisma.service';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { HomeImageJsonDto } from './dto/home-image-json.dto';
import type { NotificationPrefsDto } from './dto/notification-prefs.dto';
import type { RequestAccountDeletionDto } from './dto/request-account-deletion.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersHomeImageService } from './users-home-image.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly homeImage: UsersHomeImageService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        notificationPrefs: true,
        coachProfile: { select: { id: true, bio: true } },
        oauthAccounts: {
          where: { provider: GOOGLE_PROVIDER },
          select: { id: true },
          take: 1,
        },
        achievements: {
          include: {
            achievement: {
              select: { id: true, title: true, description: true },
            },
          },
        },
      },
    });
    const {
      notificationPrefs,
      coachProfile,
      achievements,
      oauthAccounts,
      ...u
    } = user;
    const hasGoogleAccount = oauthAccounts.length > 0;
    const hasPhone = (u.phone?.trim() ?? '').length > 0;
    return {
      user: sanitizeUser(u),
      coachProfileId: coachProfile?.id ?? null,
      coachBio: coachProfile?.bio ?? null,
      /** Google-linked members without a phone must complete it before using the account. */
      needsPhoneCompletion: hasGoogleAccount && !hasPhone,
      achievements: achievements.map((row) => ({
        id: row.achievementId,
        title: row.achievement.title,
        description: row.achievement.description,
        unlockedAt: row.unlockedAt.toISOString(),
      })),
      notificationPrefs: notificationPrefs ?? {
        bookingReminders: true,
        waitlistAlerts: true,
        promotions: false,
        communityUpdates: true,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: {
      email?: string;
      name?: string;
      lastName?: string | null;
      phone?: string | null;
      dateOfBirth?: Date | null;
      avatarUrl?: string | null;
      locale?: string;
    } = {};
    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      if (normalizedEmail === '') {
        throw new BadRequestException('Email cannot be empty');
      }
      data.email = normalizedEmail;
    }
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.phone !== undefined) {
      data.phone = normalizeOptionalPhone(dto.phone ?? null);
    }
    if (dto.dateOfBirth !== undefined) {
      data.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.locale !== undefined) {
      if (!isAppUiLocale(dto.locale)) {
        throw new BadRequestException('Invalid locale');
      }
      data.locale = dto.locale;
    }
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data,
      });
      return { user: sanitizeUser(user) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target =
          Array.isArray(error.meta?.target) &&
          error.meta.target.every((value) => typeof value === 'string')
            ? error.meta.target
            : [];
        if (target.includes('email')) {
          throw new ConflictException('Email already registered');
        }
        if (target.includes('phone')) {
          throw new ConflictException('Phone number already registered');
        }
        throw new ConflictException('Profile field must be unique');
      }
      throw error;
    }
  }

  async updateNotificationPrefs(userId: string, dto: NotificationPrefsDto) {
    await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        bookingReminders: dto.bookingReminders ?? true,
        waitlistAlerts: dto.waitlistAlerts ?? true,
        promotions: dto.promotions ?? false,
        communityUpdates: dto.communityUpdates ?? true,
      },
      update: {
        ...(dto.bookingReminders !== undefined && {
          bookingReminders: dto.bookingReminders,
        }),
        ...(dto.waitlistAlerts !== undefined && {
          waitlistAlerts: dto.waitlistAlerts,
        }),
        ...(dto.promotions !== undefined && { promotions: dto.promotions }),
        ...(dto.communityUpdates !== undefined && {
          communityUpdates: dto.communityUpdates,
        }),
      },
    });
    return this.getMe(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true },
    });
    const existingPasswordHash = user.passwordHash;
    const hasExistingPassword = existingPasswordHash !== null;

    if (hasExistingPassword) {
      const currentPassword = dto.currentPassword?.trim();
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      const currentOk = await verifyPassword(
        existingPasswordHash,
        currentPassword,
      );
      if (!currentOk) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const passwordHash = await hashPassword(dto.newPassword);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return {
      ok: true,
      message: hasExistingPassword
        ? 'Password updated successfully'
        : 'Password set successfully',
      user: sanitizeUser(updated),
    };
  }

  saveHomeImage(userId: string, file: Express.Multer.File) {
    return this.homeImage.saveHomeImage(userId, file);
  }

  saveHomeImageJson(userId: string, dto: HomeImageJsonDto) {
    return this.homeImage.saveHomeImageJson(userId, dto);
  }

  removeHomeImage(userId: string) {
    return this.homeImage.removeHomeImage(userId);
  }

  async registerPushToken(
    userId: string,
    token: string,
    platform: string,
  ): Promise<{ ok: boolean }> {
    await this.prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "PushDeviceToken" ("id","userId","token","platform","createdAt","updatedAt")
        VALUES (${randomUUID()}, ${userId}, ${token}, ${platform}, NOW(), NOW())
        ON CONFLICT ("userId", "token") DO UPDATE SET
          "platform" = EXCLUDED."platform",
          "updatedAt" = NOW()
      `,
    );
    return { ok: true };
  }

  async deleteOwnAccount(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true },
    });
    if (user.role === Role.COACH) {
      throw new BadRequestException(
        'Coach accounts can only be removed by an administrator.',
      );
    }

    const activeBookings = await this.prisma.booking.count({
      where: { userId, status: BookingStatus.BOOKED },
    });
    if (activeBookings > 0) {
      throw new BadRequestException(
        'Cannot delete an account with active bookings. Cancel them first.',
      );
    }

    try {
      await this.prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'This account has linked records and cannot be deleted. Contact support.',
        );
      }
      throw error;
    }
  }

  async requestAccountDeletion(userId: string, dto: RequestAccountDeletionDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
      },
    });
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDuplicate = await this.prisma.contactMessage.findFirst({
      where: {
        subject: 'Delete account request',
        createdAt: { gte: oneDayAgo },
        message: { contains: `userId=${user.id}` },
      },
      select: { id: true },
    });
    if (recentDuplicate) {
      throw new BadRequestException(
        'Deletion request already submitted recently',
      );
    }
    const displayName =
      `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || 'Account holder';
    const reason = dto.reason?.trim();
    const lines = [
      `Authenticated account deletion request.`,
      `userId=${user.id}`,
      `email=${user.email}`,
      reason ? `reason=${reason}` : 'reason=(not provided)',
    ];
    await this.prisma.contactMessage.create({
      data: {
        name: displayName,
        email: user.email,
        phone: user.phone ?? 'Not provided',
        subject: 'Delete account request',
        message: lines.join('\n'),
      },
    });
    return { ok: true };
  }
}
