import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { User } from '@prisma/client';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RealtimePublisherService } from './realtime-publisher.service';

@Controller('realtime')
@SkipThrottle()
export class RealtimeSseController {
  constructor(private readonly publisher: RealtimePublisherService) {}

  /** Authenticated stream — public invalidation events plus user-scoped private events. */
  @Get('events')
  @UseGuards(JwtAuthGuard)
  events(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ): void {
    this.publisher.attachAuthenticatedStream(
      res,
      user,
      req.ip,
      req.headers['x-forwarded-for'],
    );
  }

  /** Guest stream — schedule/session/cancel-intent invalidation only. */
  @Get('public')
  publicEvents(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ): void {
    this.publisher.attachPublicStream(
      res,
      req.ip,
      req.headers['x-forwarded-for'],
    );
  }
}
