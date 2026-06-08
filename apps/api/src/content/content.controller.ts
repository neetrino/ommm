import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ContentType, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContentService } from './content.service';
import { CONTENT_COVER_IMAGE_MAX_BYTES } from './content-cover-image.constants';
import { ReviewPostDto } from './dto/review-post.dto';
import { UpsertPostDto } from './dto/upsert-post.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('posts')
  listPublished(
    @Query('type') type?: ContentType,
    @Query('locale') locale?: string,
  ) {
    return this.content.listPublished(type, locale);
  }

  @Get('posts/:slug')
  bySlug(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.content.getBySlug(slug, locale);
  }

  @Get('admin/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  listAdmin() {
    return this.content.listAdmin();
  }

  @Post('admin/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  create(
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: UpsertPostDto,
  ) {
    return this.content.create(dto, user);
  }

  @Patch('admin/posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  update(
    @CurrentUser() user: { id: string; role: Role },
    @Param('id') id: string,
    @Body() dto: UpsertPostDto,
  ) {
    return this.content.update(id, dto, user);
  }

  @Post('admin/posts/:id/submit-review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  submitForReview(
    @CurrentUser() user: { id: string; role: Role },
    @Param('id') id: string,
  ) {
    return this.content.submitForReview(id, user);
  }

  @Post('admin/posts/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  review(
    @CurrentUser() user: { id: string; role: Role },
    @Param('id') id: string,
    @Body() dto: ReviewPostDto,
  ) {
    return this.content.review(id, dto, user);
  }

  @Post('admin/cover-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: CONTENT_COVER_IMAGE_MAX_BYTES },
    }),
  )
  uploadCoverImage(
    @CurrentUser() user: { id: string },
    @UploadedFile() image: Express.Multer.File | undefined,
  ) {
    return this.content.uploadCoverImage(user.id, image);
  }

  @Delete('admin/posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  remove(@Param('id') id: string) {
    return this.content.delete(id);
  }
}
