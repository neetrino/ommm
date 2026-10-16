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
} from '@nestjs/common';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_READ_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { previewCouponCheckout } from './coupon-preview.util';
import { CouponsAdminService } from './coupons-admin.service';
import { CouponsAnalyticsService } from './coupons-analytics.service';
import { ListCouponAnalyticsQueryDto } from './dto/list-coupon-analytics.dto';
import { PreviewCouponDto } from './dto/preview-coupon.dto';
import { UpsertCouponDto } from './dto/upsert-coupon.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(
    private readonly admin: CouponsAdminService,
    private readonly analytics: CouponsAnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('analytics')
  @Roles(...BACKOFFICE_READ_ROLES)
  analyticsList(@Query() query: ListCouponAnalyticsQueryDto) {
    return this.analytics.list(query);
  }

  @Post('preview')
  preview(@CurrentUser() user: { id: string }, @Body() body: PreviewCouponDto) {
    return previewCouponCheckout(this.prisma, {
      userId: user.id,
      code: body.code,
      subtotalCents: body.subtotalCents,
      lines: body.lines.map((line) => ({
        kind: line.kind,
        packagePlanId: line.packagePlanId,
      })),
      useGiftCredits: body.useGiftCredits === true,
      giftCardIds: body.giftCardIds,
    });
  }

  @Get()
  @Roles(...BACKOFFICE_READ_ROLES)
  list() {
    return this.admin.list();
  }

  @Post()
  @Roles(...BACKOFFICE_WRITE_ROLES)
  create(@CurrentUser() user: { id: string }, @Body() body: UpsertCouponDto) {
    return this.admin.create(user.id, body);
  }

  @Patch(':id')
  @Roles(...BACKOFFICE_WRITE_ROLES)
  update(@Param('id') id: string, @Body() body: UpsertCouponDto) {
    return this.admin.update(id, body);
  }

  @Post(':id/activate')
  @Roles(...BACKOFFICE_WRITE_ROLES)
  activate(@Param('id') id: string) {
    return this.admin.setStatus(id, 'ACTIVE');
  }

  @Post(':id/disable')
  @Roles(...BACKOFFICE_WRITE_ROLES)
  disable(@Param('id') id: string) {
    return this.admin.setStatus(id, 'DISABLED');
  }

  @Delete(':id')
  @Roles(...BACKOFFICE_DELETE_ROLES)
  remove(@Param('id') id: string) {
    return this.admin.removeDraft(id);
  }
}
