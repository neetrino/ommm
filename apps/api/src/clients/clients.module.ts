import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsTabListsService } from './clients-tab-lists.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientsTabListsService],
})
export class ClientsModule {}
