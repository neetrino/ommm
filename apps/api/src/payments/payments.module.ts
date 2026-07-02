import { Module } from '@nestjs/common';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { ArcaClient } from './arca/arca.client';
import { ArcaConfig } from './arca/arca.config';
import { ArcaPaymentsController } from './arca/arca-payments.controller';
import { ArcaService } from './arca/arca.service';
import { PaymentsController } from './payments.controller';
import { PaymentCashPendingEmailService } from './payment-cash-pending-email.service';
import { PaymentSuccessEmailService } from './payment-success-email.service';
import { PaymentsAdminService } from './payments-admin.service';
import { PaymentsCheckoutService } from './payments-checkout.service';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ScheduleItemsModule],
  controllers: [PaymentsController, ArcaPaymentsController],
  providers: [
    PaymentsService,
    PaymentsCheckoutService,
    PaymentsFulfillmentService,
    PaymentsAdminService,
    PaymentCashPendingEmailService,
    PaymentSuccessEmailService,
    ArcaConfig,
    ArcaClient,
    ArcaService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
