import { Module, forwardRef } from '@nestjs/common';
import { PackagesModule } from '../packages/packages.module';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { ArcaClient } from './arca/arca.client';
import { ArcaConfig } from './arca/arca.config';
import { ArcaPaymentsController } from './arca/arca-payments.controller';
import { ArcaPaymentSyncService } from './arca/arca-payment-sync.service';
import { ArcaReconciliationService } from './arca/arca-reconciliation.service';
import { ArcaService } from './arca/arca.service';
import { EhdmApiClient } from './ehdm/ehdm-api.client';
import { EhdmConfig } from './ehdm/ehdm.config';
import { EhdmMockClient } from './ehdm/ehdm-mock.client';
import { EhdmReceiptService } from './ehdm/ehdm-receipt.service';
import { EhdmSeqService } from './ehdm/ehdm-seq.service';
import { PaymentsController } from './payments.controller';
import { PaymentCashPendingEmailService } from './payment-cash-pending-email.service';
import { PaymentSuccessEmailService } from './payment-success-email.service';
import { PaymentsAdminService } from './payments-admin.service';
import { PaymentsCheckoutService } from './payments-checkout.service';
import { PaymentsConfirmService } from './payments-confirm.service';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ScheduleItemsModule, forwardRef(() => PackagesModule)],
  controllers: [PaymentsController, ArcaPaymentsController],
  providers: [
    PaymentsService,
    PaymentsCheckoutService,
    PaymentsConfirmService,
    PaymentsFulfillmentService,
    PaymentsAdminService,
    PaymentCashPendingEmailService,
    PaymentSuccessEmailService,
    ArcaConfig,
    ArcaClient,
    ArcaService,
    ArcaPaymentSyncService,
    ArcaReconciliationService,
    EhdmConfig,
    EhdmApiClient,
    EhdmMockClient,
    EhdmSeqService,
    EhdmReceiptService,
  ],
  exports: [
    PaymentsService,
    ArcaService,
    ArcaReconciliationService,
    EhdmReceiptService,
  ],
})
export class PaymentsModule {}
