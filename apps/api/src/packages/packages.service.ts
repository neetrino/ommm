import { Injectable } from '@nestjs/common';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ReconcilePackagesDto } from './dto/reconcile-packages.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import { PackagesAdminService } from './packages-admin.service';
import { PackagesPublicService } from './packages-public.service';

@Injectable()
export class PackagesService {
  constructor(
    private readonly publicService: PackagesPublicService,
    private readonly adminService: PackagesAdminService,
  ) {}

  listPlans() {
    return this.publicService.listPlans();
  }

  listPlansAdmin() {
    return this.adminService.listPlansAdmin();
  }

  listCategoryNamesAdmin() {
    return this.adminService.listCategoryNamesAdmin();
  }

  createPlan(dto: UpsertPackagePlanDto) {
    return this.adminService.createPlan(dto);
  }

  updatePlan(id: string, dto: UpsertPackagePlanDto) {
    return this.adminService.updatePlan(id, dto);
  }

  deletePlan(id: string) {
    return this.adminService.deletePlan(id);
  }

  updateCategoryStatus(dto: UpdateCategoryStatusDto) {
    return this.adminService.updateCategoryStatus(dto);
  }

  deleteCategory(dto: DeleteCategoryDto) {
    return this.adminService.deleteCategory(dto);
  }

  getDeletionBlockers(planId: string) {
    return this.adminService.getDeletionBlockers(planId);
  }

  syncExpired(dto: ReconcilePackagesDto) {
    return this.adminService.syncExpired(dto);
  }

  reconcileSessions(dto: ReconcilePackagesDto) {
    return this.adminService.reconcileSessions(dto);
  }

  listMine(userId: string) {
    return this.publicService.listMine(userId);
  }

  subscribe(userId: string, dto: SubscribePackageDto) {
    return this.publicService.subscribe(userId, dto);
  }
}
