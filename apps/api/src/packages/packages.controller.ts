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
import { PackageStatus, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePlanDto } from './dto/create-plan.dto';
import { ChangePackagePlanDto } from './dto/change-package-plan.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
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
  @Roles(Role.ADMIN)
  listPlansAdmin() {
    return this.packages.listPlansAdmin();
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listCategoryNamesAdmin() {
    return this.packages.listCategoryNamesAdmin();
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createPlan(@Body() dto: CreatePlanDto) {
    return this.packages.createPlan(dto);
  }

  @Patch('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.packages.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deletePlan(@Param('id') id: string) {
    return this.packages.deletePlan(id);
  }

  @Delete('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteCategory(@Body() dto: DeleteCategoryDto) {
    return this.packages.deletePlansByCategory(dto.categoryName);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: { id: string }) {
    return this.packages.listMine(user.id);
  }

  @Post('me/subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(
    @CurrentUser() user: { id: string },
    @Body() dto: SubscribePackageDto,
  ) {
    return this.packages.subscribeWithManualPayment(
      user.id,
      dto.planId,
      dto.paymentMethod,
    );
  }

  @Patch('me/:id/pause')
  @UseGuards(JwtAuthGuard)
  pause(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.packages.pause(user.id, id);
  }

  @Patch('me/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.packages.cancel(user.id, id);
  }

  @Patch('me/:id/renew')
  @UseGuards(JwtAuthGuard)
  renew(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.packages.renew(user.id, id);
  }

  @Patch('me/:id/change-plan')
  @UseGuards(JwtAuthGuard)
  changePlan(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ChangePackagePlanDto,
  ) {
    return this.packages.changePlan(user.id, id, dto.planId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminAll(@Query('take') take?: string, @Query('offset') offset?: string) {
    return this.packages.listAllAdmin({
      take: take ? Number.parseInt(take, 10) : undefined,
      offset: offset ? Number.parseInt(offset, 10) : undefined,
    });
  }

  @Post('admin/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  assign(@Body('userId') userId: string, @Body('planId') planId: string) {
    return this.packages.assignManual(userId, planId);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminStatus(
    @Param('id') id: string,
    @Body('status') status: PackageStatus,
  ) {
    return this.packages.adminSetStatus(id, status);
  }
}
