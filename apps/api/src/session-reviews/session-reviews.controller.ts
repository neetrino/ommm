import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Role, type User } from '@prisma/client';
import { BACKOFFICE_READ_ROLES } from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListPaginationQueryDto } from '../common/dto/list-pagination-query.dto';
import { SubmitSessionReviewDto } from './dto/submit-session-review.dto';
import { SessionReviewsService } from './session-reviews.service';

@Controller('session-reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionReviewsController {
  constructor(private readonly sessionReviews: SessionReviewsService) {}

  @Get('pending')
  @SkipThrottle()
  @Roles(Role.USER)
  listPending(@CurrentUser() user: User) {
    return this.sessionReviews.listPendingForUser(user.id);
  }

  @Get('inbox')
  @SkipThrottle()
  @Roles(...BACKOFFICE_READ_ROLES)
  listInbox(@Query() query: ListPaginationQueryDto) {
    return this.sessionReviews.listStaffInbox(
      query.offset ?? 0,
      query.take,
    );
  }

  @Get('inbox/unread-count')
  @SkipThrottle()
  @Roles(...BACKOFFICE_READ_ROLES)
  unreadCount() {
    return this.sessionReviews.unreadStaffCount();
  }

  @Post('inbox/mark-read')
  @Roles(...BACKOFFICE_READ_ROLES)
  markRead() {
    return this.sessionReviews.markStaffInboxRead();
  }

  @Get('coach')
  @SkipThrottle()
  @Roles(Role.COACH)
  listCoach(@CurrentUser() user: User, @Query() query: ListPaginationQueryDto) {
    return this.sessionReviews.listCoachInbox(
      user.id,
      query.offset ?? 0,
      query.take,
    );
  }

  @Post(':id/submit')
  @Roles(Role.USER)
  submit(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SubmitSessionReviewDto,
  ) {
    return this.sessionReviews.submit(user.id, id, dto);
  }

  @Post(':id/dismiss')
  @Roles(Role.USER)
  dismiss(@CurrentUser() user: User, @Param('id') id: string) {
    return this.sessionReviews.dismiss(user.id, id);
  }
}
