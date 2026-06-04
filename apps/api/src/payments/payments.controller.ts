import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import { AdminUpdatePaymentStatusDto } from './dto/admin-update-payment-status.dto';
import { ConfirmGiftPaymentDto } from './dto/confirm-gift-payment.dto';
import { CreateGiftCheckoutDto } from './dto/create-gift-checkout.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('checkout/gift')
  @UseGuards(JwtAuthGuard)
  checkoutGift(
    @CurrentUser() user: { id: string },
    @Body() body: CreateGiftCheckoutDto,
  ) {
    const amountAmd = body.resolvedAmountAmd;
    if (amountAmd === undefined) {
      throw new BadRequestException('Gift amount is required');
    }
    return this.payments.createGiftCheckout({
      purchaserId: user.id,
      batchId: body.batchId,
      amountCents: amountAmd,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      message: body.message,
    });
  }

  @Post('checkout/gift/:reference/confirm')
  @UseGuards(JwtAuthGuard)
  confirmGiftPayment(
    @CurrentUser() user: { id: string },
    @Param('reference') reference: string,
    @Body() body: ConfirmGiftPaymentDto,
  ) {
    return this.payments.confirmGiftPayment(
      user.id,
      reference,
      body.paymentMethod,
    );
  }

  @Post('checkout/dropin/:sessionId')
  @UseGuards(JwtAuthGuard)
  checkoutDropIn(
    @CurrentUser() user: { id: string },
    @Param('sessionId') sessionId: string,
  ) {
    return this.payments.createDropInCheckout(user.id, sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  myPayments(@CurrentUser() user: { id: string }) {
    return this.payments.listPayments(user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  adminList(@Query() query: AdminListPaymentsQueryDto) {
    return this.payments.adminListPayments(query);
  }

  @Patch('admin/:paymentId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  adminUpdateStatus(
    @CurrentUser() user: { id: string },
    @Param('paymentId') paymentId: string,
    @Body() body: AdminUpdatePaymentStatusDto,
  ) {
    return this.payments.adminUpdatePaymentStatus(
      paymentId,
      body.status,
      user.id,
    );
  }
}
