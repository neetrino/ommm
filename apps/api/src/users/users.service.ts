import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Express } from 'express';
import { Prisma } from '@prisma/client';
import { sanitizeUser } from '../auth/auth.service';
import { hashPassword, verifyPassword } from '../common/password-crypto';
import { isAppUiLocale } from '../common/app-ui-locales';
import { PrismaService } from '../prisma/prisma.service';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import {
  ALLOWED_HOME_IMAGE_MIMES,
  HOME_IMAGE_MAX_BYTES,
  MIME_TO_EXT,
  normalizeHomeImageMime,
} from './constants/home-image.constants';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { HomeImageJsonDto } from './dto/home-image-json.dto';
import type { NotificationPrefsDto } from './dto/notification-prefs.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { absolutePathForStoredUpload } from './user-upload.helpers';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly r2HomeImage: R2HomeImageStorage,
  ) {}

  private get uploadRoot(): string {
    const raw = this.config.get<string>('UPLOAD_DIR');
    if (raw !== undefined && raw.trim() !== '') {
      return raw.trim();
    }
    return join(process.cwd(), 'uploads');
  }

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
    if (dto.locale !== undefined) {
      if (!isAppUiLocale(dto.locale)) {
        throw new BadRequestException('Invalid locale');
      }
      data.locale = dto.locale;
    }
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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user.passwordHash) {
      throw new BadRequestException(
        'Password sign-in is not enabled for this account',
      );
    }
    const currentOk = await verifyPassword(
      user.passwordHash,
      dto.currentPassword,
    );
    if (!currentOk) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Password updated successfully' };
  }

  async saveHomeImage(userId: string, file: Express.Multer.File) {
    const buf = this.assertHomeImageBuffer(file);
    const mime = normalizeHomeImageMime(file.mimetype);
    return this.persistHomeImage(userId, buf, mime);
  }

  async saveHomeImageJson(userId: string, dto: HomeImageJsonDto) {
    let raw = dto.imageBase64.trim().replace(/\s/g, '');
    const marker = 'base64,';
    const splitIdx = raw.indexOf(marker);
    if (raw.startsWith('data:') && splitIdx !== -1) {
      raw = raw.slice(splitIdx + marker.length);
    }
    let buf: Buffer;
    try {
      buf = Buffer.from(raw, 'base64');
    } catch {
      throw new BadRequestException('Invalid base64 image data');
    }
    if (!buf.length) {
      throw new BadRequestException('Image data is empty');
    }
    if (buf.length > HOME_IMAGE_MAX_BYTES) {
      throw new BadRequestException(
        'Image is too large. Maximum size is 5 MB.',
      );
    }
    const mime = normalizeHomeImageMime(dto.mimeType);
    if (!ALLOWED_HOME_IMAGE_MIMES.has(mime)) {
      throw new BadRequestException(
        'Only JPG, JPEG, PNG, or WEBP images are allowed',
      );
    }
    if (!MIME_TO_EXT[mime]) {
      throw new BadRequestException('Invalid image type');
    }
    return this.persistHomeImage(userId, buf, mime);
  }

  private async persistHomeImage(
    userId: string,
    buf: Buffer,
    mimeInput: string,
  ) {
    const mime = normalizeHomeImageMime(mimeInput);
    if (!ALLOWED_HOME_IMAGE_MIMES.has(mime) || !MIME_TO_EXT[mime]) {
      throw new BadRequestException('Invalid image type');
    }

    if (this.isR2HomeImageRequired() && !this.r2HomeImage.isConfigured()) {
      throw new ServiceUnavailableException(
        `Home image upload requires R2. Incomplete env: ${this.r2HomeImage.listMissingR2Env().join(', ')}`,
      );
    }

    const prev = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { homeImageUrl: true },
    });

    const storedValue = await this.storeHomeImagePayload(userId, buf, mime);

    await this.prisma.user.update({
      where: { id: userId },
      data: { homeImageUrl: storedValue },
    });

    if (prev.homeImageUrl && prev.homeImageUrl !== storedValue) {
      await this.removeStoredHomeImage(prev.homeImageUrl);
    }

    const fresh = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return {
      user: sanitizeUser(fresh),
      message: 'Home image updated successfully',
    };
  }

  private async storeHomeImagePayload(
    userId: string,
    buf: Buffer,
    mime: string,
  ): Promise<string> {
    const ext = MIME_TO_EXT[mime];
    if (!ext) {
      throw new BadRequestException('Invalid image type');
    }
    const filename = `${randomUUID()}.${ext}`;
    if (this.r2HomeImage.isConfigured()) {
      const key = `user-home/${userId}/${filename}`;
      return this.r2HomeImage.putObject({
        key,
        body: buf,
        contentType: mime,
      });
    }
    const dir = join(this.uploadRoot, 'user-home', userId);
    await mkdir(dir, { recursive: true });
    const diskPath = join(dir, filename);
    await writeFile(diskPath, buf);
    return `/v1/uploads/user-home/${userId}/${filename}`;
  }

  private assertHomeImageBuffer(file: Express.Multer.File): Buffer {
    const mime = normalizeHomeImageMime(file.mimetype);
    if (!ALLOWED_HOME_IMAGE_MIMES.has(mime)) {
      throw new BadRequestException(
        'Only JPG, JPEG, PNG, or WEBP images are allowed',
      );
    }
    if (!MIME_TO_EXT[mime]) {
      throw new BadRequestException('Invalid image type');
    }
    const buf = file.buffer;
    if (!buf?.length) {
      throw new BadRequestException('Image file is required');
    }
    return buf;
  }

  private isR2HomeImageRequired(): boolean {
    const raw = this.config.get<string>('R2_HOME_IMAGE_REQUIRED')?.trim();
    return raw === '1' || raw?.toLowerCase() === 'true';
  }

  private async removeStoredHomeImage(stored: string): Promise<void> {
    if (stored.startsWith('http://') || stored.startsWith('https://')) {
      await this.r2HomeImage.deleteObjectIfOwned(stored);
      return;
    }
    await this.safeUnlinkStored(stored);
  }

  private async safeUnlinkStored(storedPublicPath: string): Promise<void> {
    const abs = absolutePathForStoredUpload(this.uploadRoot, storedPublicPath);
    if (!abs) {
      return;
    }
    try {
      await unlink(abs);
    } catch (err) {
      this.logger.warn(
        `Could not remove old upload file (${storedPublicPath}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
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
}
