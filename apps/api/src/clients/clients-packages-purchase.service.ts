import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PackagesService } from '../packages/packages.service';
import type { AdminPurchaseClientPackageDto } from './dto/admin-purchase-client-package.dto';

@Injectable()
export class ClientsPackagesPurchaseService {
  constructor(
    private readonly packages: PackagesService,
    private readonly audit: AuditService,
  ) {}

  async purchase(
    actor: User,
    clientId: string,
    dto: AdminPurchaseClientPackageDto,
  ) {
    const result = await this.packages.adminPurchaseForClient({
      adminId: actor.id,
      clientId,
      planId: dto.planId,
      paymentMethod: dto.paymentMethod,
    });

    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CLIENT_PACKAGE_PURCHASED',
      entityType: 'UserPackage',
      entityId: result.userPackageId,
      payload: {
        clientId,
        planId: result.planId,
        userPackageId: result.userPackageId,
        paymentId: result.paymentId,
        paymentMethod: result.paymentMethod,
        amountCents: result.amountCents,
        currency: result.currency,
      },
    });

    return result;
  }
}
