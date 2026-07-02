import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PackageUsageEligibilityService } from './package-usage-eligibility.service';
import { PackageUsageLedgerService } from './package-usage-ledger.service';
import { PackageUsageMaintenanceService } from './package-usage-maintenance.service';
import { PackageUsageService } from './package-usage.service';
import { PackagesAdminService } from './packages-admin.service';
import { PackagesController } from './packages.controller';
import { PackagesPublicService } from './packages-public.service';
import { PackagesService } from './packages.service';

@Module({
  imports: [CacheModule],
  controllers: [PackagesController],
  providers: [
    PackagesPublicService,
    PackagesAdminService,
    PackagesService,
    PackageUsageService,
    PackageUsageEligibilityService,
    PackageUsageLedgerService,
    PackageUsageMaintenanceService,
  ],
  exports: [PackagesService, PackageUsageService],
})
export class PackagesModule {}
