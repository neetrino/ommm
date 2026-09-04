import { PrismaService } from '../../prisma/prisma.service';
import { detectPaymentSource, readPaymentSource } from '../payments.helpers';
import {
  resolveAdminPaymentRelatedItemName,
  type AdminPaymentPackageLabels,
} from '../payments-related-item.util';
import { resolveEhdmItemName } from './ehdm-print-body.builder';

type PaymentNameFields = {
  description: string | null;
  sourceId: string | null;
  source: unknown;
};

export async function resolvePaymentEhdmItemName(
  prisma: PrismaService,
  payment: PaymentNameFields,
): Promise<string> {
  const source = detectPaymentSource(
    payment.description,
    readPaymentSource(payment),
  );
  const packageLabels = await loadPackageLabels(prisma, payment, source);
  return resolveEhdmItemName(
    resolveAdminPaymentRelatedItemName({
      source,
      description: payment.description,
      sourceId: payment.sourceId,
      packageLabelsByUserPackageId: packageLabels,
    }),
    payment.description,
  );
}

async function loadPackageLabels(
  prisma: PrismaService,
  payment: { sourceId: string | null },
  source: ReturnType<typeof detectPaymentSource>,
): Promise<Map<string, AdminPaymentPackageLabels>> {
  if (source !== 'package' || payment.sourceId === null) {
    return new Map();
  }
  const userPackage = await prisma.userPackage.findUnique({
    where: { id: payment.sourceId },
    select: {
      id: true,
      planNameSnapshot: true,
      planCategoryNameSnapshot: true,
      plan: { select: { name: true, categoryName: true } },
    },
  });
  if (!userPackage) {
    return new Map();
  }
  const groupName = (
    userPackage.plan?.categoryName ?? userPackage.planCategoryNameSnapshot
  ).trim();
  return new Map([
    [
      userPackage.id,
      {
        name: userPackage.plan?.name ?? userPackage.planNameSnapshot,
        groupName: groupName.length > 0 ? groupName : null,
      },
    ],
  ]);
}
