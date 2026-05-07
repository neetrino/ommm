import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ContentType, Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ContentService } from "./content.service";
import { UpsertPostDto } from "./dto/upsert-post.dto";

@Controller("content")
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get("posts")
  listPublished(@Query("type") type?: ContentType) {
    return this.content.listPublished(type);
  }

  @Get("posts/:slug")
  bySlug(@Param("slug") slug: string) {
    return this.content.getBySlug(slug);
  }

  @Get("admin/posts")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  listAdmin() {
    return this.content.listAdmin();
  }

  @Post("admin/posts")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  create(@Body() dto: UpsertPostDto) {
    return this.content.create(dto);
  }

  @Patch("admin/posts/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  update(@Param("id") id: string, @Body() dto: UpsertPostDto) {
    return this.content.update(id, dto);
  }

  @Delete("admin/posts/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_ADMIN)
  remove(@Param("id") id: string) {
    return this.content.delete(id);
  }
}
