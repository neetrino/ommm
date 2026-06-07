import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { PackageUsageService } from './package-usage.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  imports: [PaymentsModule],
  controllers: [PackagesController],
  providers: [PackagesService, PackageUsageService],
  exports: [PackagesService, PackageUsageService],
})
export class PackagesModule {}
