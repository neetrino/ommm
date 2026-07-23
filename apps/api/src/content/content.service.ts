import { Injectable } from '@nestjs/common';
import { ContentType, Role } from '@prisma/client';
import type { Express } from 'express';
import { ContentAdminService } from './content-admin.service';
import { ContentCoverImageService } from './content-cover-image.service';
import { ContentPublicService } from './content-public.service';
import { ReviewPostDto } from './dto/review-post.dto';
import type { UpsertPostDto } from './dto/upsert-post.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly publicContent: ContentPublicService,
    private readonly adminContent: ContentAdminService,
    private readonly coverImage: ContentCoverImageService,
  ) {}

  uploadCoverImage(actorId: string, file: Express.Multer.File | undefined) {
    return this.coverImage.uploadCoverImage(actorId, file);
  }

  listPublished(type?: ContentType, localeInput?: string) {
    return this.publicContent.listPublished(type, localeInput);
  }

  getBySlug(slug: string, localeInput?: string) {
    return this.publicContent.getBySlug(slug, localeInput);
  }

  listAdmin() {
    return this.adminContent.listAdmin();
  }

  create(dto: UpsertPostDto, actor: { id: string; role: Role }) {
    return this.adminContent.create(dto, actor);
  }

  update(id: string, dto: UpsertPostDto, actor: { id: string; role: Role }) {
    return this.adminContent.update(id, dto, actor);
  }

  submitForReview(id: string, actor: { id: string; role: Role }) {
    return this.adminContent.submitForReview(id, actor);
  }

  review(id: string, dto: ReviewPostDto, actor: { id: string; role: Role }) {
    return this.adminContent.review(id, dto, actor);
  }

  delete(id: string) {
    return this.adminContent.delete(id);
  }
}
