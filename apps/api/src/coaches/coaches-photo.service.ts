import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PUBLIC_CACHE_KEYS } from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { absolutePathForStoredUpload } from '../users/user-upload.helpers';
import type { UploadCoachPhotoJsonDto } from './dto/upload-coach-photo-json.dto';
import { COACH_PHOTO_MAX_BYTES, COACH_PHOTO_MIME_EXT } from './coaches.types';

const COACH_LOCAL_UPLOAD_PREFIXES = [
  '/v1/uploads/coach-avatar/',
  '/v1/uploads/coach-card-image/',
] as const;

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
    const profile = await this.findCoachWithUser(coachProfileId);
    const buffer = this.decodeImageBuffer(dto);
    this.assertR2Configured();

    const filename = `${randomUUID()}.${this.extForMime(dto.mimeType)}`;
    const avatarUrl = await this.r2Storage.putObject({
      key: `coach-avatar/${profile.user.id}/${filename}`,
      body: buffer,
      contentType: dto.mimeType.trim().toLowerCase(),
    });

    await this.prisma.user.update({
      where: { id: profile.user.id },
      data: { avatarUrl },
    });
    await this.removeOldCoachPhoto(profile.user.avatarUrl, avatarUrl);
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.coaches);
    return { avatarUrl };
  }

  async uploadCoachCardImageJson(
    coachProfileId: string,
    dto: UploadCoachPhotoJsonDto,
  ): Promise<{ cardImageUrl: string }> {
    const profile = await this.findCoachWithCardImage(coachProfileId);
    const buffer = this.decodeImageBuffer(dto);
    this.assertR2Configured();

    const filename = `${randomUUID()}.${this.extForMime(dto.mimeType)}`;
    const cardImageUrl = await this.r2Storage.putObject({
      key: `coach-card-image/${profile.user.id}/${filename}`,
      body: buffer,
      contentType: dto.mimeType.trim().toLowerCase(),
    });

    await this.prisma.coachProfile.update({
      where: { id: coachProfileId },
      data: { cardImageUrl },
    });
    await this.removeOldCoachPhoto(profile.cardImageUrl, cardImageUrl);
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.coaches);
    return { cardImageUrl };
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
    const isLocalCoachUpload = COACH_LOCAL_UPLOAD_PREFIXES.some((prefix) =>
      previousUrl.startsWith(prefix),
    );
    if (!isLocalCoachUpload) {
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

  private async findCoachWithUser(coachProfileId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      include: { user: { select: { id: true, avatarUrl: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    return profile;
  }

  private async findCoachWithCardImage(coachProfileId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      select: {
        id: true,
        cardImageUrl: true,
        user: { select: { id: true } },
      },
    });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    return profile;
  }

  private assertR2Configured(): void {
    if (!this.r2Storage.isConfigured()) {
      throw new ServiceUnavailableException(
        `Coach photo upload requires R2. Incomplete env: ${this.r2Storage.listMissingR2Env().join(', ')}`,
      );
    }
  }

  private extForMime(mimeTypeRaw: string): string {
    const mimeType = mimeTypeRaw.trim().toLowerCase();
    const ext = COACH_PHOTO_MIME_EXT[mimeType];
    if (!ext) {
      throw new BadRequestException('Unsupported image type');
    }
    return ext;
  }

  private decodeImageBuffer(dto: UploadCoachPhotoJsonDto): Buffer {
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
    return buffer;
  }
}
