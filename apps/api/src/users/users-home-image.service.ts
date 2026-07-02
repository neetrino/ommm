import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Express } from 'express';
import { sanitizeUser } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import {
  ALLOWED_HOME_IMAGE_MIMES,
  HOME_IMAGE_MAX_BYTES,
  MIME_TO_EXT,
  normalizeHomeImageMime,
} from './constants/home-image.constants';
import type { HomeImageJsonDto } from './dto/home-image-json.dto';
import { absolutePathForStoredUpload } from './user-upload.helpers';

@Injectable()
export class UsersHomeImageService {
  private readonly logger = new Logger(UsersHomeImageService.name);

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

  async removeHomeImage(userId: string) {
    const prev = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { homeImageUrl: true },
    });

    if (!prev.homeImageUrl) {
      const fresh = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
      return {
        user: sanitizeUser(fresh),
        message: 'Home image removed successfully',
      };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { homeImageUrl: null },
    });

    await this.removeStoredHomeImage(prev.homeImageUrl);

    const fresh = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return {
      user: sanitizeUser(fresh),
      message: 'Home image removed successfully',
    };
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
}
