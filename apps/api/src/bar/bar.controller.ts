import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BACKOFFICE_WRITE_ROLES } from '../common/backoffice-roles';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateBarProductDto, UpdateBarProductDto } from './bar.dto';
import { BarService } from './bar.service';

@Controller('bar')
export class BarController {
  constructor(private readonly bar: BarService) {}

  @Get('products')
  listActive() {
    return this.bar.listActive();
  }

  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  listAll() {
    return this.bar.listAll();
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  create(@Body() dto: CreateBarProductDto) {
    return this.bar.create(dto);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateBarProductDto) {
    return this.bar.update(id, dto);
  }
}
