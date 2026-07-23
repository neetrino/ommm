import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Express } from 'express';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { absolutePathForStoredGiftCardUpload } from './gift-card-upload.helpers';
import {
  ALLOWED_GIFT_CARD_IMAGE_MIMES,
  GIFT_CARD_IMAGE_MIME_TO_EXT,
  normalizeGiftCardImageMime,
} from './gift-card-image.constants';

@Injectable()
export class GiftCardsImageService {
  private readonly logger = new Logger(GiftCardsImageService.name);

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

  async storeGiftCardImage(
    adminId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const { buffer, mime } = this.assertGiftCardImageBuffer(file);
    const ext = GIFT_CARD_IMAGE_MIME_TO_EXT[mime];
    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    if (this.r2Storage.isConfigured()) {
      const key = `gift-cards/${adminId}/${filename}`;
      return this.r2Storage.putObject({
        key,
        body: buffer,
        contentType: mime,
      });
    }
    const dir = join(this.uploadRoot, 'gift-cards', adminId);
    await mkdir(dir, { recursive: true });
    const diskPath = join(dir, filename);
    await writeFile(diskPath, buffer);
    return `/v1/uploads/gift-cards/${adminId}/${filename}`;
  }

  async removeStoredGiftCardImage(stored: string): Promise<void> {
    if (stored.startsWith('http://') || stored.startsWith('https://')) {
      await this.r2Storage.deleteObjectIfOwned(stored);
      return;
    }
    const absolute = absolutePathForStoredGiftCardUpload(
      this.uploadRoot,
      stored,
    );
    if (!absolute) {
      return;
    }
    try {
      await unlink(absolute);
    } catch (error) {
      this.logger.warn(
        `Could not remove uploaded gift-card image (${stored}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private assertGiftCardImageBuffer(file: Express.Multer.File): {
    buffer: Buffer;
    mime: string;
  } {
    const mime = normalizeGiftCardImageMime(file.mimetype);
    if (!ALLOWED_GIFT_CARD_IMAGE_MIMES.has(mime)) {
      throw new BadRequestException(
        'Only JPG, JPEG, PNG, or WEBP images are allowed',
      );
    }
    if (!GIFT_CARD_IMAGE_MIME_TO_EXT[mime]) {
      throw new BadRequestException('Invalid image type');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    return { buffer: file.buffer, mime };
  }
}
