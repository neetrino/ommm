import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateGiftCheckoutDto } from "./dto/create-gift-checkout.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("webhook")
  @SkipThrottle()
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string | undefined,
  ) {
    const raw = req.rawBody;
    if (!raw) {
      throw new ServiceUnavailableException(
        "Stripe webhook is not enabled (raw body not available on this deploy).",
      );
    }
    await this.payments.handleStripeWebhook(raw, signature);
    return { received: true };
  }

  @Post("checkout/membership/:planId")
  @UseGuards(JwtAuthGuard)
  checkoutMembership(
    @CurrentUser() user: { id: string },
    @Param("planId") planId: string,
  ) {
    return this.payments.createMembershipCheckout(user.id, planId);
  }

  @Post("checkout/gift")
  @UseGuards(JwtAuthGuard)
  checkoutGift(
    @CurrentUser() user: { id: string },
    @Body() body: CreateGiftCheckoutDto,
  ) {
    return this.payments.createGiftCheckout({
      purchaserId: user.id,
      amountCents: body.amountCents,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      message: body.message,
    });
  }

  @Post("checkout/dropin/:sessionId")
  @UseGuards(JwtAuthGuard)
  checkoutDropIn(
    @CurrentUser() user: { id: string },
    @Param("sessionId") sessionId: string,
  ) {
    return this.payments.createDropInCheckout(user.id, sessionId);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  myPayments(@CurrentUser() user: { id: string }) {
    return this.payments.listPayments(user.id);
  }
}
