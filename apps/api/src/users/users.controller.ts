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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import type { Express } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HOME_IMAGE_MAX_BYTES } from './constants/home-image.constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HomeImageJsonDto } from './dto/home-image-json.dto';
import { NotificationPrefsDto } from './dto/notification-prefs.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /**
   * Called frequently from Next.js RSC layouts (`/users/me` per navigation).
   * Do not apply the global HTTP throttle here — 429 was misread as “logged out”
   * and blocked Admin dashboards under bursty dev/prefetch traffic.
   */
  @Get('me')
  @SkipThrottle()
  me(@CurrentUser() user: { id: string }) {
    return this.users.getMe(user.id);
  }

  @Patch('me')
  patchMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  patchPassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.users.changePassword(user.id, dto);
  }

  @Post('me/home-image-json')
  uploadHomeImageJson(
    @CurrentUser() user: { id: string },
    @Body() dto: HomeImageJsonDto,
  ) {
    return this.users.saveHomeImageJson(user.id, dto);
  }

  @Post('me/home-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: HOME_IMAGE_MAX_BYTES },
    }),
  )
  uploadHomeImage(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.users.saveHomeImage(user.id, file);
  }

  @Patch('me/notifications')
  patchNotifs(
    @CurrentUser() user: { id: string },
    @Body() dto: NotificationPrefsDto,
  ) {
    return this.users.updateNotificationPrefs(user.id, dto);
  }

  @Post('me/push-token')
  registerPush(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.users.registerPushToken(user.id, dto.token, dto.platform);
  }
}
