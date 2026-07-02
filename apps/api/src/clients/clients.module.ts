import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ClientsAdminService } from './clients-admin.service';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsTabListsService } from './clients-tab-lists.service';

@Module({
  imports: [MailModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsAdminService, ClientsTabListsService],
})
export class ClientsModule {}
