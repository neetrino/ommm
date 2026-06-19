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
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateCombinedPackagePlanDto } from './dto/create-combined-package-plan.dto';
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
  @Roles(Role.ADMIN, Role.MANAGER)
  listPlansAdmin() {
    return this.packages.listPlansAdmin();
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  listCategoryNamesAdmin() {
    return this.packages.listCategoryNamesAdmin();
  }

  @Patch('admin/categories/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  updateCategoryStatus(@Body() dto: UpdateCategoryStatusDto) {
    return this.packages.updateCategoryStatus(dto);
  }

  @Delete('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  deleteCategory(@Body() dto: DeleteCategoryDto) {
    return this.packages.deleteCategory(dto);
  }

  @Get('admin/plans/:id/deletion-blockers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getDeletionBlockers(@Param('id') id: string) {
    return this.packages.getDeletionBlockers(id);
  }

  @Post('admin/sync-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  syncExpired(@Body() dto: ReconcilePackagesDto) {
    return this.packages.syncExpired(dto);
  }

  @Post('admin/reconcile-sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  reconcileSessions(@Body() dto: ReconcilePackagesDto) {
    return this.packages.reconcileSessions(dto);
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createPlan(@Body() dto: UpsertPackagePlanDto) {
    return this.packages.createPlan(dto);
  }

  @Post('plans/combined')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createCombinedPlan(@Body() dto: CreateCombinedPackagePlanDto) {
    return this.packages.createCombinedPlan(dto);
  }

  @Patch('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  updatePlan(@Param('id') id: string, @Body() dto: UpsertPackagePlanDto) {
    return this.packages.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
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
