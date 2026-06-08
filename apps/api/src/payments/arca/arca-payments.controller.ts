import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InitArcaPaymentDto } from '../dto/init-arca-payment.dto';
import { ArcaService } from './arca.service';

@Controller('payments/arca')
export class ArcaPaymentsController {
  constructor(private readonly arca: ArcaService) {}

  @Post('init')
  @UseGuards(JwtAuthGuard)
  init(@CurrentUser() user: { id: string }, @Body() body: InitArcaPaymentDto) {
    return this.arca.initPayment({
      userId: user.id,
      paymentReference: body.paymentReference,
      locale: body.locale,
    });
  }

  @Get('callback')
  async callback(
    @Query('reference') paymentReference: string | undefined,
    @Query('orderId') arcaOrderId: string | undefined,
    @Res() res: Response,
  ) {
    const result = await this.arca.handleCallback({
      paymentReference: paymentReference ?? '',
      arcaOrderId,
    });
    res.redirect(302, result.redirectUrl);
  }
}
