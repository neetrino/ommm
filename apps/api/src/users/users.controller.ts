import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { HOME_IMAGE_MAX_BYTES } from "./constants/home-image.constants";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { NotificationPrefsDto } from "./dto/notification-prefs.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: { id: string }) {
    return this.users.getMe(user.id);
  }

  @Patch("me")
  patchMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch("me/password")
  patchPassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.users.changePassword(user.id, dto);
  }

  @Post("me/home-image")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: HOME_IMAGE_MAX_BYTES },
    }),
  )
  uploadHomeImage(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }
    return this.users.saveHomeImage(user.id, file);
  }

  @Patch("me/notifications")
  patchNotifs(
    @CurrentUser() user: { id: string },
    @Body() dto: NotificationPrefsDto,
  ) {
    return this.users.updateNotificationPrefs(user.id, dto);
  }
}
