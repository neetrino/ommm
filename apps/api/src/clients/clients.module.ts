import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { MailModule } from '../mail/mail.module';
import { PackagesModule } from '../packages/packages.module';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { ClientsAdminCreateService } from './clients-admin-create.service';
import { ClientsAdminService } from './clients-admin.service';
import { ClientsBookingsCreateService } from './clients-bookings-create.service';
import { ClientsBookingsRetroactiveService } from './clients-bookings-retroactive.service';
import { ClientsController } from './clients.controller';
import { ClientsPackagesPurchaseService } from './clients-packages-purchase.service';
import { ClientsService } from './clients.service';
import { ClientsTabListsService } from './clients-tab-lists.service';

@Module({
  imports: [MailModule, PackagesModule, BookingsModule, ScheduleItemsModule],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    ClientsAdminCreateService,
    ClientsAdminService,
    ClientsTabListsService,
    ClientsPackagesPurchaseService,
    ClientsBookingsCreateService,
    ClientsBookingsRetroactiveService,
  ],
})
export class ClientsModule {}
