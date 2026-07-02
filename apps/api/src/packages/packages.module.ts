import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PackageUsageEligibilityService } from './package-usage-eligibility.service';
import { PackageUsageLedgerService } from './package-usage-ledger.service';
import { PackageUsageMaintenanceService } from './package-usage-maintenance.service';
import { PackageUsageService } from './package-usage.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  imports: [CacheModule],
  controllers: [PackagesController],
  providers: [
    PackagesService,
    PackageUsageService,
    PackageUsageEligibilityService,
    PackageUsageLedgerService,
    PackageUsageMaintenanceService,
  ],
  exports: [PackagesService, PackageUsageService],
})
export class PackagesModule {}
