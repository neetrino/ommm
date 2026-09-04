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
import { AdminAdjustUserPackageSessionsDto } from './dto/admin-adjust-user-package-sessions.dto';
import { AdminUpdateUserPackageValidityDto } from './dto/admin-update-user-package-validity.dto';
import { FreezeUserPackageDto } from './dto/freeze-user-package.dto';
import { AdminListSoldPackagesQueryDto } from './dto/admin-list-sold-packages-query.dto';
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

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  getAdminStats() {
    return this.packages.getAdminStats();
  }

  @Get('admin/sold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  listSoldAdmin(@Query() query: AdminListSoldPackagesQueryDto) {
    return this.packages.listSoldAdmin(query);
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

  @Patch('admin/user-packages/:id/validity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateUserPackageValidity(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserPackageValidityDto,
  ) {
    return this.packages.updateUserPackageValidity(id, dto);
  }

  @Patch('admin/user-packages/:id/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adjustUserPackageSessions(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AdminAdjustUserPackageSessionsDto,
  ) {
    return this.packages.adjustUserPackageSessions(user, id, dto);
  }

  @Patch('admin/user-packages/:id/freeze')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  freezeUserPackageForAdmin(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: FreezeUserPackageDto,
  ) {
    return this.packages.freezeForAdmin(user.id, id, dto);
  }

  @Patch('admin/user-packages/:id/unfreeze')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  unfreezeUserPackageForAdmin(@Param('id') id: string) {
    return this.packages.unfreezeForAdmin(id);
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

  @Patch('me/:id/freeze')
  @UseGuards(JwtAuthGuard)
  freezeMine(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: FreezeUserPackageDto,
  ) {
    return this.packages.freezeMine(user.id, id, dto);
  }

  @Patch('me/:id/unfreeze')
  @UseGuards(JwtAuthGuard)
  unfreezeMine(@CurrentUser() user: User, @Param('id') id: string) {
    return this.packages.unfreezeMine(user.id, id);
  }
}
