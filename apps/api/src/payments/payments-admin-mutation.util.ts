import { BadRequestException } from '@nestjs/common';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import type { AdminUpdatablePaymentStatus } from './dto/admin-update-payment-status.dto';
import {
  isAllowedCardStatusTransition,
  isAllowedStudioStatusTransition,
  isStudioManualPaymentMethod,
} from './studio-manual-payment.util';

export function assertAdminPaymentStatusChange(params: {
  paymentMethod: ManualPaymentMethod | null;
  current: PaymentStatus;
  next: AdminUpdatablePaymentStatus;
}): void {
  if (params.current === params.next) {
    return;
  }
  if (params.paymentMethod === ManualPaymentMethod.CARD) {
    if (!isAllowedCardStatusTransition(params.current, params.next)) {
      throw new BadRequestException(
        'Online card status can only be failed or refunded by staff',
      );
    }
    return;
  }
  if (isStudioManualPaymentMethod(params.paymentMethod)) {
    if (!isAllowedStudioStatusTransition(params.current, params.next)) {
      throw new BadRequestException(
        'Studio payment status cannot move from this state',
      );
    }
    return;
  }
  if (params.paymentMethod === ManualPaymentMethod.INFLUENCER) {
    throw new BadRequestException('Influencer payments cannot be edited');
  }
  if (!isAllowedCardStatusTransition(params.current, params.next)) {
    throw new BadRequestException(
      'Only studio cash or terminal payments can change status this way',
    );
  }
}

export function assertAdminPaymentMethodChange(params: {
  current: ManualPaymentMethod | null;
  next: ManualPaymentMethod;
}): void {
  if (!isStudioManualPaymentMethod(params.current)) {
    throw new BadRequestException(
      'Only cash and terminal payment methods can be swapped',
    );
  }
  if (!isStudioManualPaymentMethod(params.next)) {
    throw new BadRequestException(
      'Payment method can only be cash or terminal',
    );
  }
}
