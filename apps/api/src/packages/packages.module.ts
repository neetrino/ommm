import { Module } from '@nestjs/common';
import { PackageUsageService } from './package-usage.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  controllers: [PackagesController],
  providers: [PackagesService, PackageUsageService],
  exports: [PackagesService, PackageUsageService],
})
export class PackagesModule {}
