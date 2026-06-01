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
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookingsService } from './bookings.service';
import { AdminBookingsManagementQueryDto } from './dto/admin-bookings-management-query.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateBookingNoteDto } from './dto/create-booking-note.dto';
import { MoveBookingDto } from './dto/move-booking.dto';
import { UpdateAdminBookingDto } from './dto/update-admin-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  book(
    @CurrentUser() user: { id: string },
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookings.book(user.id, sessionId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: { id: string }) {
    return this.bookings.listMine(user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.bookings.cancel(user.id, id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  adminList(
    @CurrentUser() user: User,
    @Query('sessionId') sessionId?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookings.listAdmin({
      actor: user,
      sessionId,
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('admin/management')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  adminManagement(
    @CurrentUser() user: User,
    @Query() query: AdminBookingsManagementQueryDto,
  ) {
    return this.bookings.listAdminManagement({
      actor: user,
      query,
    });
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  adminCancel(@Param('id') id: string) {
    return this.bookings.adminCancel(id);
  }

  @Patch('admin/:id/move')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  move(@Param('id') id: string, @Body() dto: MoveBookingDto) {
    return this.bookings.moveBooking(id, dto.targetSessionId);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  adminGet(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookings.adminGetById(user, id);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  adminUpdate(@Param('id') id: string, @Body() dto: UpdateAdminBookingDto) {
    return this.bookings.adminUpdate(id, dto);
  }

  @Delete('admin/:id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminDeletePermanent(@Param('id') id: string) {
    return this.bookings.adminDeletePermanent(id);
  }

  @Patch('admin/:id/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  attendance(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('attended') attended: boolean,
  ) {
    return this.bookings.markAttended(user, id, Boolean(attended));
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  note(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateBookingNoteDto,
  ) {
    return this.bookings.addNote(user, id, dto);
  }
}
