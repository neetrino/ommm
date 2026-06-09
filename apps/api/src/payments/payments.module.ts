import { Module } from '@nestjs/common';
import { ArcaClient } from './arca/arca.client';
import { ArcaConfig } from './arca/arca.config';
import { ArcaPaymentsController } from './arca/arca-payments.controller';
import { ArcaService } from './arca/arca.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController, ArcaPaymentsController],
  providers: [PaymentsService, ArcaConfig, ArcaClient, ArcaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
