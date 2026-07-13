import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PackagesModule } from '../packages/packages.module';
import { ClientsAdminCreateService } from './clients-admin-create.service';
import { ClientsAdminService } from './clients-admin.service';
import { ClientsController } from './clients.controller';
import { ClientsPackagesPurchaseService } from './clients-packages-purchase.service';
import { ClientsService } from './clients.service';
import { ClientsTabListsService } from './clients-tab-lists.service';

@Module({
  imports: [MailModule, PackagesModule],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    ClientsAdminCreateService,
    ClientsAdminService,
    ClientsTabListsService,
    ClientsPackagesPurchaseService,
  ],
})
export class ClientsModule {}
