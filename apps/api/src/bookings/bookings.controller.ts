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
import { CreateBookingNoteDto } from './dto/create-booking-note.dto';
import { MoveBookingDto } from './dto/move-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  book(
    @CurrentUser() user: { id: string },
    @Param('sessionId') sessionId: string,
  ) {
    return this.bookings.book(user.id, sessionId);
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
    @Query('sessionId') sessionId?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookings.listAdmin({
      sessionId,
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
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

  @Patch('admin/:id/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  attendance(@Param('id') id: string, @Body('attended') attended: boolean) {
    return this.bookings.markAttended(id, Boolean(attended));
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
