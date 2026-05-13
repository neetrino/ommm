import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AddClientNoteDto } from './dto/add-client-note.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  list() {
    return this.clients.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.clients.get(id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clients.updateBasicInfo(id, dto);
  }

  @Get(':id/notes')
  notes(@Param('id') id: string) {
    return this.clients.listNotes(id);
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
