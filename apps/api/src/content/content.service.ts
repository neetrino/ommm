import { Injectable, NotFoundException } from "@nestjs/common";
import { ContentStatus, ContentType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { UpsertPostDto } from "./dto/upsert-post.dto";

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished(type?: ContentType) {
    return this.prisma.contentPost.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        ...(type && { type }),
      },
      orderBy: { publishedAt: "desc" },
    });
  }

  getBySlug(slug: string) {
    return this.prisma.contentPost.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
  }

  listAdmin() {
    return this.prisma.contentPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
  }

  create(dto: UpsertPostDto) {
    return this.prisma.contentPost.create({
      data: {
        type: dto.type,
        status: dto.status,
        slug: dto.slug.toLowerCase(),
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        coverImageUrl: dto.coverImageUrl,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });
  }

  async update(id: string, dto: UpsertPostDto) {
    const existing = await this.prisma.contentPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException();
    }
    return this.prisma.contentPost.update({
      where: { id },
      data: {
        type: dto.type,
        status: dto.status,
        slug: dto.slug.toLowerCase(),
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        coverImageUrl: dto.coverImageUrl,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.contentPost.delete({ where: { id } });
    return { ok: true };
  }
}
