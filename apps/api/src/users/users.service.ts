import { Injectable } from "@nestjs/common";
import { sanitizeUser } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import type { NotificationPrefsDto } from "./dto/notification-prefs.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        notificationPrefs: true,
        coachProfile: { select: { id: true } },
        achievements: {
          include: {
            achievement: {
              select: { id: true, title: true, description: true },
            },
          },
        },
      },
    });
    const { notificationPrefs, coachProfile, achievements, ...u } = user;
    return {
      user: sanitizeUser(u),
      coachProfileId: coachProfile?.id ?? null,
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
      name?: string;
      phone?: string | null;
      dateOfBirth?: Date | null;
      avatarUrl?: string | null;
      locale?: string;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.dateOfBirth !== undefined) {
      data.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.locale !== undefined) data.locale = dto.locale;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return { user: sanitizeUser(user) };
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
}
