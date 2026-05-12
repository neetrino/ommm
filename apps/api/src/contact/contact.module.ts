import { Module } from '@nestjs/common';
import { StudioModule } from '../studio/studio.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [StudioModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
