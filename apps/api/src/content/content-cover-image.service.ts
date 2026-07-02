import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Express } from 'express';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import {
  ALLOWED_CONTENT_COVER_IMAGE_MIMES,
  CONTENT_COVER_IMAGE_MAX_BYTES,
  CONTENT_COVER_IMAGE_MIME_TO_EXT,
  normalizeContentCoverImageMime,
} from './content-cover-image.constants';

@Injectable()
export class ContentCoverImageService {
  constructor(
    private readonly config: ConfigService,
    private readonly r2Storage: R2HomeImageStorage,
  ) {}

  private get uploadRoot(): string {
    const raw = this.config.get<string>('UPLOAD_DIR');
    if (raw !== undefined && raw.trim() !== '') {
      return raw.trim();
    }
    return join(process.cwd(), 'uploads');
  }

  async uploadCoverImage(
    actorId: string,
    file: Express.Multer.File | undefined,
  ): Promise<{ coverImageUrl: string }> {
    if (file === undefined) {
      throw new BadRequestException('Image file is required');
    }
    if (file.size > CONTENT_COVER_IMAGE_MAX_BYTES) {
      throw new BadRequestException('Image file is too large');
    }
    const coverImageUrl = await this.storeCoverImage(actorId, file);
    return { coverImageUrl };
  }

  private assertCoverImageBuffer(file: Express.Multer.File): {
    buffer: Buffer;
    mime: string;
  } {
    const mime = normalizeContentCoverImageMime(file.mimetype);
    if (!ALLOWED_CONTENT_COVER_IMAGE_MIMES.has(mime)) {
      throw new BadRequestException(
        'Only JPG, JPEG, PNG, or WEBP images are allowed',
      );
    }
    if (!CONTENT_COVER_IMAGE_MIME_TO_EXT[mime]) {
      throw new BadRequestException('Invalid image type');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    return { buffer: file.buffer, mime };
  }

  private async storeCoverImage(
    actorId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const { buffer, mime } = this.assertCoverImageBuffer(file);
    const ext = CONTENT_COVER_IMAGE_MIME_TO_EXT[mime];
    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    if (this.r2Storage.isConfigured()) {
      const key = `content-covers/${actorId}/${filename}`;
      return this.r2Storage.putObject({
        key,
        body: buffer,
        contentType: mime,
      });
    }
    const dir = join(this.uploadRoot, 'content-covers', actorId);
    await mkdir(dir, { recursive: true });
    const diskPath = join(dir, filename);
    await writeFile(diskPath, buffer);
    return `/v1/uploads/content-covers/${actorId}/${filename}`;
  }
}
