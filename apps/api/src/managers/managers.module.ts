import { Module } from '@nestjs/common';
import { ManagersController } from './managers.controller';
import { ManagersInviteService } from './managers-invite.service';
import { ManagersListService } from './managers-list.service';
import { ManagersService } from './managers.service';
import { ManagersWriteService } from './managers-write.service';

@Module({
  controllers: [ManagersController],
  providers: [
    ManagersService,
    ManagersListService,
    ManagersWriteService,
    ManagersInviteService,
  ],
})
export class ManagersModule {}
