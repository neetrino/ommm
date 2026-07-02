import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import {
  PUBLIC_CACHE_KEYS,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { absolutePathForStoredUpload } from '../users/user-upload.helpers';
import type { UploadCoachPhotoJsonDto } from './dto/upload-coach-photo-json.dto';
import {
  COACH_PHOTO_MAX_BYTES,
  COACH_PHOTO_MIME_EXT,
} from './coaches.types';

@Injectable()
export class CoachesPhotoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Storage: R2HomeImageStorage,
    private readonly cache: RedisCacheService,
  ) {}

  async uploadCoachPhotoJson(
    coachProfileId: string,
    dto: UploadCoachPhotoJsonDto,
  ): Promise<{ avatarUrl: string }> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      include: { user: { select: { id: true, avatarUrl: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    const mimeType = dto.mimeType.trim().toLowerCase();
    const ext = COACH_PHOTO_MIME_EXT[mimeType];
    if (!ext) {
      throw new BadRequestException('Unsupported image type');
    }
    const rawBase64 = dto.imageBase64.trim().replace(/\s/g, '');
    const payloadStart = rawBase64.indexOf('base64,');
    const normalizedBase64 =
      rawBase64.startsWith('data:') && payloadStart >= 0
        ? rawBase64.slice(payloadStart + 'base64,'.length)
        : rawBase64;
    const buffer = Buffer.from(normalizedBase64, 'base64');
    if (buffer.length === 0) {
      throw new BadRequestException('Image data is empty');
    }
    if (buffer.length > COACH_PHOTO_MAX_BYTES) {
      throw new BadRequestException('Photo is too large (max 10 MB)');
    }
    if (!this.r2Storage.isConfigured()) {
      throw new ServiceUnavailableException(
        `Coach photo upload requires R2. Incomplete env: ${this.r2Storage.listMissingR2Env().join(', ')}`,
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const avatarUrl = await this.r2Storage.putObject({
      key: `coach-avatar/${profile.user.id}/${filename}`,
      body: buffer,
      contentType: mimeType,
    });

    await this.prisma.user.update({
      where: { id: profile.user.id },
      data: { avatarUrl },
    });
    await this.removeOldCoachPhoto(profile.user.avatarUrl, avatarUrl);
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.coaches);
    return { avatarUrl };
  }

  async removeOldCoachPhoto(
    previousUrl: string | null,
    nextUrl: string,
  ): Promise<void> {
    if (previousUrl === null || previousUrl === nextUrl) {
      return;
    }
    if (
      previousUrl.startsWith('https://') ||
      previousUrl.startsWith('http://')
    ) {
      await this.r2Storage.deleteObjectIfOwned(previousUrl);
      return;
    }
    if (!previousUrl.startsWith('/v1/uploads/coach-avatar/')) {
      return;
    }
    const absolutePath = absolutePathForStoredUpload(
      join(process.cwd(), 'uploads'),
      previousUrl,
    );
    if (!absolutePath) {
      return;
    }
    try {
      await unlink(absolutePath);
    } catch {
      // Old upload cleanup is best effort.
    }
  }
}
