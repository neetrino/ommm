import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PackageUsageService } from './package-usage.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  imports: [CacheModule],
  controllers: [PackagesController],
  providers: [PackagesService, PackageUsageService],
  exports: [PackagesService, PackageUsageService],
})
export class PackagesModule {}
