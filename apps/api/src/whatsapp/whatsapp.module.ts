import { Global, Module } from '@nestjs/common';
import { WhatsappAdminController } from './whatsapp-admin.controller';
import { WhatsappAdminService } from './whatsapp-admin.service';
import { WhatsappBookingConfirmedService } from './whatsapp-booking-confirmed.service';
import { WhatsappCredentialsService } from './whatsapp-credentials.service';
import { WhatsappGatewayClient } from './whatsapp-gateway.client';
import { WhatsappMembershipExpiryService } from './whatsapp-membership-expiry.service';
import { WhatsappNotifyService } from './whatsapp-notify.service';
import { WhatsappPackagePurchasedService } from './whatsapp-package-purchased.service';

@Global()
@Module({
  controllers: [WhatsappAdminController],
  providers: [
    WhatsappCredentialsService,
    WhatsappGatewayClient,
    WhatsappNotifyService,
    WhatsappAdminService,
    WhatsappBookingConfirmedService,
    WhatsappPackagePurchasedService,
    WhatsappMembershipExpiryService,
  ],
  exports: [
    WhatsappNotifyService,
    WhatsappBookingConfirmedService,
    WhatsappPackagePurchasedService,
    WhatsappMembershipExpiryService,
  ],
})
export class WhatsappModule {}
