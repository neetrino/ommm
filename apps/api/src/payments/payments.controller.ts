import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { sendXlsxAttachment } from '../common/xlsx/xlsx-response';
import { MANAGER_PERMISSION_MATRIX } from '../common/manager-permission.matrix';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminExportPaymentsQueryDto } from './dto/admin-export-payments-query.dto';
import { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import { AdminUpdatePaymentMethodDto } from './dto/admin-update-payment-method.dto';
import { AdminUpdatePaymentPaidAtDto } from './dto/admin-update-payment-paid-at.dto';
import { AdminUpdatePaymentStatusDto } from './dto/admin-update-payment-status.dto';
import { ConfirmDropInPaymentDto } from './dto/confirm-dropin-payment.dto';
import { ConfirmGiftPaymentDto } from './dto/confirm-gift-payment.dto';
import { CreateCartCheckoutDto } from './dto/create-cart-checkout.dto';
import { CreateGiftCheckoutDto } from './dto/create-gift-checkout.dto';
import { ListMyPaymentsQueryDto } from './dto/list-my-payments-query.dto';
import { PaymentOutcomeQueryDto } from './dto/payment-outcome-query.dto';
import { paymentsExportFilename } from './payments-export-filename';
import { buildPaymentsXlsx } from './payments-export-xlsx';
import { clampPaymentsQueryToToday } from './payments-today-query.util';
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
    if (body.type !== 'FIXED_CLASS' && amountAmd === undefined) {
      throw new BadRequestException('Gift amount is required');
    }
    return this.payments.createGiftCheckout({
      purchaserId: user.id,
      batchId: body.batchId,
      amountCents: amountAmd ?? 0,
      recipientId: body.recipientId,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      recipientPhone: body.recipientPhone,
      message: body.message,
      giftType: body.type,
      classTypeId: body.classTypeId,
      classQuantity: body.classQuantity,
      packagePlanId: body.packagePlanId,
      delivery: body.delivery,
      format: body.format,
      deliverAt: body.deliverAt,
      couponCode: body.couponCode,
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

  @Post('checkout/cart')
  @UseGuards(JwtAuthGuard)
  checkoutCart(
    @CurrentUser() user: { id: string },
    @Body() body: CreateCartCheckoutDto,
  ) {
    return this.payments.createCartCheckout(user.id, body);
  }

  @Post('checkout/dropin/:sessionId')
  @UseGuards(JwtAuthGuard)
  checkoutDropIn(
    @CurrentUser() user: { id: string },
    @Param('sessionId') sessionId: string,
    @Query('useGiftCredits') useGiftCredits?: string,
    @Query('couponCode') couponCode?: string,
  ) {
    return this.payments.createDropInCheckout(
      user.id,
      sessionId,
      useGiftCredits === 'true',
      couponCode,
    );
  }

  @Post('checkout/dropin/:reference/confirm')
  @UseGuards(JwtAuthGuard)
  confirmDropInPayment(
    @CurrentUser() user: { id: string },
    @Param('reference') reference: string,
    @Body() body: ConfirmDropInPaymentDto,
  ) {
    return this.payments.confirmDropInPayment(
      user.id,
      reference,
      body.paymentMethod,
    );
  }

  @Get('me/outcome')
  @UseGuards(JwtAuthGuard)
  paymentOutcome(
    @CurrentUser() user: { id: string },
    @Query() query: PaymentOutcomeQueryDto,
  ) {
    return this.payments.getPaymentOutcomeByReference(user.id, query.reference);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  myPayments(
    @CurrentUser() user: { id: string },
    @Query() query: ListMyPaymentsQueryDto,
  ) {
    return this.payments.listPayments(user.id, query);
  }

  /** Admin finance table — RSC/prefetch bursts in Next.js dev must not 429. */
  @Get('admin')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANAGER_PERMISSION_MATRIX.payments.adminFinance)
  adminList(@Query() query: AdminListPaymentsQueryDto) {
    return this.payments.adminListPayments(query);
  }

  /** Excel workbook of every payment matching the admin finance filters. */
  @Get('admin/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANAGER_PERMISSION_MATRIX.payments.adminFinance)
  async adminExport(
    @Query() query: AdminExportPaymentsQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const { items, planNames } = await this.payments.adminExportPayments(query);
    const buffer = await buildPaymentsXlsx({
      locale: query.locale,
      from: query.from,
      to: query.to,
      items,
    });
    sendXlsxAttachment(
      res,
      paymentsExportFilename({ locale: query.locale, query, planNames }),
      buffer,
    );
  }

  /** Same table as `admin`, but any `from`/`to` is replaced with today (studio timezone). */
  @Get('admin/today')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANAGER_PERMISSION_MATRIX.payments.listToday)
  adminListToday(@Query() query: AdminListPaymentsQueryDto) {
    return this.payments.adminListPayments(clampPaymentsQueryToToday(query));
  }

  @Patch('admin/:paymentId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANAGER_PERMISSION_MATRIX.payments.updateStatus)
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

  @Patch('admin/:paymentId/paid-at')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANAGER_PERMISSION_MATRIX.payments.updatePaidAt)
  adminUpdatePaidAt(
    @Param('paymentId') paymentId: string,
    @Body() body: AdminUpdatePaymentPaidAtDto,
  ) {
    return this.payments.adminUpdatePaymentPaidAt(paymentId, body.paidAt);
  }

  @Patch('admin/:paymentId/method')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANAGER_PERMISSION_MATRIX.payments.updateMethod)
  adminUpdateMethod(
    @CurrentUser() user: { id: string },
    @Param('paymentId') paymentId: string,
    @Body() body: AdminUpdatePaymentMethodDto,
  ) {
    return this.payments.adminUpdatePaymentMethod(
      paymentId,
      body.paymentMethod,
      user.id,
    );
  }

  @Post('admin/:paymentId/arca/sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANAGER_PERMISSION_MATRIX.payments.adminArcaSync)
  adminSyncArcaPayment(@Param('paymentId') paymentId: string) {
    return this.payments.adminSyncArcaPayment(paymentId);
  }
}
