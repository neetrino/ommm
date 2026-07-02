import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { BookingsAdminManagementService } from './bookings-admin-management.service';
import { BookingsAdminService } from './bookings-admin.service';
import { BookingsClientService } from './bookings-client.service';
import type { AdminBookingsManagementQueryDto } from './dto/admin-bookings-management-query.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';
import type { CreateBookingNoteDto } from './dto/create-booking-note.dto';
import type { ListMyBookingsQueryDto } from './dto/list-my-bookings-query.dto';
import type { UpdateAdminBookingDto } from './dto/update-admin-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly client: BookingsClientService,
    private readonly admin: BookingsAdminService,
    private readonly adminManagement: BookingsAdminManagementService,
  ) {}

  listEligiblePackagesForSession(userId: string, sessionId: string) {
    return this.client.listEligiblePackagesForSession(userId, sessionId);
  }

  listPurchasePlansForSession(sessionId: string) {
    return this.client.listPurchasePlansForSession(sessionId);
  }

  book(userId: string, sessionId: string, dto?: CreateBookingDto) {
    return this.client.book(userId, sessionId, dto);
  }

  registerCancelIntent(userId: string, bookingId: string) {
    return this.client.registerCancelIntent(userId, bookingId);
  }

  clearCancelIntent(userId: string, bookingId: string) {
    return this.client.clearCancelIntent(userId, bookingId);
  }

  cancel(userId: string, bookingId: string) {
    return this.client.cancel(userId, bookingId);
  }

  listMine(userId: string, query: ListMyBookingsQueryDto = {}) {
    return this.client.listMine(userId, query);
  }

  adminCancel(bookingId: string) {
    return this.admin.adminCancel(bookingId);
  }

  moveBooking(bookingId: string, targetSessionId: string) {
    return this.admin.moveBooking(bookingId, targetSessionId);
  }

  markAttended(actor: User, bookingId: string, attended: boolean) {
    return this.admin.markAttended(actor, bookingId, attended);
  }

  addNote(author: User, bookingId: string, dto: CreateBookingNoteDto) {
    return this.admin.addNote(author, bookingId, dto);
  }

  listAdmin(filters: {
    actor: User;
    sessionId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  }) {
    return this.admin.listAdmin(filters);
  }

  listAdminManagement(params: {
    actor: User;
    query: AdminBookingsManagementQueryDto;
  }) {
    return this.adminManagement.listAdminManagement(params);
  }

  adminGetById(actor: User, bookingId: string) {
    return this.admin.adminGetById(actor, bookingId);
  }

  adminUpdate(bookingId: string, dto: UpdateAdminBookingDto) {
    return this.admin.adminUpdate(bookingId, dto);
  }

  adminDeletePermanent(bookingId: string) {
    return this.admin.adminDeletePermanent(bookingId);
  }
}
