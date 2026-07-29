import { Injectable } from '@nestjs/common';
import { ManualPaymentMethod } from '@prisma/client';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ReconcilePackagesDto } from './dto/reconcile-packages.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import { PackagesAdminClientPurchaseService } from './packages-admin-client-purchase.service';
import { PackagesAdminService } from './packages-admin.service';
import { PackagesAdminValidityService } from './packages-admin-validity.service';
import { PackagesPublicService } from './packages-public.service';
import type { AdminUpdateUserPackageValidityDto } from './dto/admin-update-user-package-validity.dto';

type AdminClientPackagePaymentMethod =
  | typeof ManualPaymentMethod.CASH
  | typeof ManualPaymentMethod.CARD_TERMINAL;

@Injectable()
export class PackagesService {
  constructor(
    private readonly publicService: PackagesPublicService,
    private readonly adminService: PackagesAdminService,
    private readonly adminClientPurchase: PackagesAdminClientPurchaseService,
    private readonly adminValidity: PackagesAdminValidityService,
  ) {}

  listPlans() {
    return this.publicService.listPlans();
  }

  listPlansCoveringClassType(classTypeId: string) {
    return this.publicService.listPlansCoveringClassType(classTypeId);
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

  adminPurchaseForClient(params: {
    adminId: string;
    clientId: string;
    planId: string;
    paymentMethod: AdminClientPackagePaymentMethod;
  }) {
    return this.adminClientPurchase.purchase(params);
  }

  updateUserPackageValidity(
    userPackageId: string,
    dto: AdminUpdateUserPackageValidityDto,
  ) {
    return this.adminValidity.updateValidity(userPackageId, dto);
  }
}
