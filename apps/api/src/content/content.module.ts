import { Module } from '@nestjs/common';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { ContentAdminService } from './content-admin.service';
import { ContentCoverImageService } from './content-cover-image.service';
import { ContentController } from './content.controller';
import { ContentPublicService } from './content-public.service';
import { ContentService } from './content.service';

@Module({
  controllers: [ContentController],
  providers: [
    ContentService,
    ContentPublicService,
    ContentAdminService,
    ContentCoverImageService,
    R2HomeImageStorage,
  ],
  exports: [ContentService],
})
export class ContentModule {}
