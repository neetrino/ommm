import { Module } from '@nestjs/common';
import { ClientInviteController } from './client-invite.controller';
import { ClientInviteService } from './client-invite.service';

@Module({
  controllers: [ClientInviteController],
  providers: [ClientInviteService],
  exports: [ClientInviteService],
})
export class ClientInviteModule {}
