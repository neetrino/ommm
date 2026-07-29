import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { User } from '@prisma/client';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListPaginationQueryDto } from '../common/dto/list-pagination-query.dto';
import { AddClientNoteDto } from './dto/add-client-note.dto';
import { AdminCreateClientDto } from './dto/admin-create-client.dto';
import { AdminCreateClientBookingDto } from './dto/admin-create-client-booking.dto';
import { AdminListClientsQueryDto } from './dto/admin-list-clients-query.dto';
import { AdminPurchaseClientPackageDto } from './dto/admin-purchase-client-package.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientsBookingsCreateService } from './clients-bookings-create.service';
import { ClientsPackagesPurchaseService } from './clients-packages-purchase.service';
import { ClientsService } from './clients.service';
import { ClientsTabListsService } from './clients-tab-lists.service';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...BACKOFFICE_WRITE_ROLES)
export class ClientsController {
  constructor(
    private readonly clients: ClientsService,
    private readonly tabLists: ClientsTabListsService,
    private readonly packagesPurchase: ClientsPackagesPurchaseService,
    private readonly bookingsCreate: ClientsBookingsCreateService,
  ) {}

  /** Admin lists (clients, finance members) — same RSC burst pattern as coaches admin list. */
  @Get()
  @SkipThrottle()
  list(@Query() query: AdminListClientsQueryDto) {
    return this.clients.list(query);
  }

  @Post()
  @Roles(...BACKOFFICE_WRITE_ROLES)
  create(@CurrentUser() user: User, @Body() dto: AdminCreateClientDto) {
    return this.clients.create(user, dto);
  }

  @Get(':id/bookings')
  listBookings(
    @Param('id') id: string,
    @Query() query: ListPaginationQueryDto,
  ) {
    const take = query.take ?? 25;
    const offset = query.offset ?? 0;
    return this.tabLists.listBookings(id, take, offset);
  }

  @Post(':id/bookings')
  @Roles(...BACKOFFICE_WRITE_ROLES)
  createBooking(
    @Param('id') id: string,
    @Body() dto: AdminCreateClientBookingDto,
  ) {
    return this.bookingsCreate.createForClient(id, dto);
  }

  @Get(':id/sessions/:sessionId/eligible-packages')
  @Roles(...BACKOFFICE_WRITE_ROLES)
  listEligiblePackagesForSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.bookingsCreate.listEligiblePackages(id, sessionId);
  }

  @Get(':id/payments')
  listPayments(
    @Param('id') id: string,
    @Query() query: ListPaginationQueryDto,
  ) {
    const take = query.take ?? 25;
    const offset = query.offset ?? 0;
    return this.tabLists.listPayments(id, take, offset);
  }

  @Get(':id/packages')
  listPackages(
    @Param('id') id: string,
    @Query() query: ListPaginationQueryDto,
  ) {
    const take = query.take ?? 25;
    const offset = query.offset ?? 0;
    return this.tabLists.listPackages(id, take, offset);
  }

  @Post(':id/packages/purchase')
  @Roles(...BACKOFFICE_WRITE_ROLES)
  purchasePackage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AdminPurchaseClientPackageDto,
  ) {
    return this.packagesPurchase.purchase(user, id, dto);
  }

  @Get(':id/gift-cards')
  listGiftCards(
    @Param('id') id: string,
    @Query() query: ListPaginationQueryDto,
  ) {
    const take = query.take ?? 25;
    const offset = query.offset ?? 0;
    return this.tabLists.listGiftCards(id, take, offset);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.clients.get(id);
  }

  @Patch(':id')
  patch(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clients.updateBasicInfo(user, id, dto);
  }

  @Delete(':id')
  @Roles(...BACKOFFICE_DELETE_ROLES)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.clients.remove(user, id);
  }

  @Post(':id/notes')
  addNote(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddClientNoteDto,
  ) {
    return this.clients.addNote(user.id, user.role, id, dto.body);
  }
}
