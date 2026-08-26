import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PaymentsModule } from '../payments/payments.module';
import { PackageUsageEligibilityService } from './package-usage-eligibility.service';
import { PackageUsageLedgerService } from './package-usage-ledger.service';
import { PackageUsageMaintenanceService } from './package-usage-maintenance.service';
import { PackageUsageService } from './package-usage.service';
import { PackagesAdminClientPurchaseService } from './packages-admin-client-purchase.service';
import { PackagesAdminService } from './packages-admin.service';
import { PackagesAdminValidityService } from './packages-admin-validity.service';
import { PackagesActivationService } from './packages-activation.service';
import { PackagesFreezeService } from './packages-freeze.service';
import { PackagesController } from './packages.controller';
import { PackagesPublicService } from './packages-public.service';
import { PackagesService } from './packages.service';

@Module({
  imports: [CacheModule, forwardRef(() => PaymentsModule)],
  controllers: [PackagesController],
  providers: [
    PackagesPublicService,
    PackagesAdminService,
    PackagesAdminClientPurchaseService,
    PackagesAdminValidityService,
    PackagesFreezeService,
    PackagesActivationService,
    PackagesService,
    PackageUsageService,
    PackageUsageEligibilityService,
    PackageUsageLedgerService,
    PackageUsageMaintenanceService,
  ],
  exports: [
    PackagesService,
    PackageUsageService,
    PackagesPublicService,
    PackagesFreezeService,
    PackagesActivationService,
  ],
})
export class PackagesModule {}
