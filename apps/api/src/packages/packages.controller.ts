import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ReconcilePackagesDto } from './dto/reconcile-packages.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Get('plans')
  listPlans() {
    return this.packages.listPlans();
  }

  @Get('admin/plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  listPlansAdmin() {
    return this.packages.listPlansAdmin();
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  listCategoryNamesAdmin() {
    return this.packages.listCategoryNamesAdmin();
  }

  @Patch('admin/categories/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateCategoryStatus(@Body() dto: UpdateCategoryStatusDto) {
    return this.packages.updateCategoryStatus(dto);
  }

  @Delete('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  deleteCategory(@Body() dto: DeleteCategoryDto) {
    return this.packages.deleteCategory(dto);
  }

  @Get('admin/plans/:id/deletion-blockers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  getDeletionBlockers(@Param('id') id: string) {
    return this.packages.getDeletionBlockers(id);
  }

  @Post('admin/sync-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  syncExpired(@Body() dto: ReconcilePackagesDto) {
    return this.packages.syncExpired(dto);
  }

  @Post('admin/reconcile-sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  reconcileSessions(@Body() dto: ReconcilePackagesDto) {
    return this.packages.reconcileSessions(dto);
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  createPlan(@Body() dto: UpsertPackagePlanDto) {
    return this.packages.createPlan(dto);
  }

  @Patch('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updatePlan(@Param('id') id: string, @Body() dto: UpsertPackagePlanDto) {
    return this.packages.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  deletePlan(@Param('id') id: string) {
    return this.packages.deletePlan(id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: User) {
    return this.packages.listMine(user.id);
  }

  @Post('me/subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@CurrentUser() user: User, @Body() dto: SubscribePackageDto) {
    return this.packages.subscribe(user.id, dto);
  }
}
