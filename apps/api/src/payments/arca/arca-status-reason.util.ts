import {
  ARCA_ORDER_STATUS,
  evaluateArcaOrderStatus,
  normalizePaymentState,
} from './arca-status.util';
import { ARCA_PAYMENT_STATE, type ArcaOrderStatusResponse } from './arca.types';
import {
  PAYMENT_STATUS_REASON,
  type PaymentStatusReason,
} from '../payment-status-reason';

/** Common Arca actionCode values (Merchant Manual appendix). */
const ARCA_ACTION_CODE = {
  NO_PAYMENT_ATTEMPTED: -100,
  SESSION_TIME_LIMIT: -2007,
  INSUFFICIENT_FUNDS: -2019,
  EXCEEDS_AMOUNT_LIMIT: -2018,
} as const;

/**
 * Maps an Arca getOrderStatusExtended response onto a short status-reason code
 * for PENDING / FAILED payments shown in admin and member UI.
 */
export function resolveArcaStatusReason(
  response: ArcaOrderStatusResponse,
): PaymentStatusReason {
  const evaluation = evaluateArcaOrderStatus(response);
  if (evaluation === 'deposited') {
    return PAYMENT_STATUS_REASON.UNKNOWN;
  }
  if (evaluation === 'in_progress') {
    return resolveInProgressReason(response);
  }
  if (evaluation === 'failed') {
    return resolveFailedReason(response);
  }
  return PAYMENT_STATUS_REASON.UNKNOWN;
}

function resolveInProgressReason(
  response: ArcaOrderStatusResponse,
): PaymentStatusReason {
  if (response.orderStatus === ARCA_ORDER_STATUS.ACS_INITIATED) {
    return PAYMENT_STATUS_REASON.BANK_PROCESSING;
  }
  if (response.actionCode === ARCA_ACTION_CODE.NO_PAYMENT_ATTEMPTED) {
    return PAYMENT_STATUS_REASON.AWAITING_BANK;
  }
  return PAYMENT_STATUS_REASON.BANK_PROCESSING;
}

function resolveFailedReason(
  response: ArcaOrderStatusResponse,
): PaymentStatusReason {
  const state = normalizePaymentState(
    response.paymentAmountInfo?.paymentState ?? response.paymentState,
  );
  if (state === ARCA_PAYMENT_STATE.REVERSED) {
    return PAYMENT_STATUS_REASON.REVERSED;
  }
  if (state === ARCA_PAYMENT_STATE.REFUNDED) {
    return PAYMENT_STATUS_REASON.REFUNDED;
  }
  if (response.orderStatus === ARCA_ORDER_STATUS.REVERSED) {
    return PAYMENT_STATUS_REASON.REVERSED;
  }
  if (response.orderStatus === ARCA_ORDER_STATUS.REFUNDED) {
    return PAYMENT_STATUS_REASON.REFUNDED;
  }

  const actionCode =
    typeof response.actionCode === 'number' ? response.actionCode : undefined;
  if (actionCode === ARCA_ACTION_CODE.SESSION_TIME_LIMIT) {
    return PAYMENT_STATUS_REASON.SESSION_EXPIRED;
  }
  if (
    actionCode === ARCA_ACTION_CODE.INSUFFICIENT_FUNDS ||
    actionCode === ARCA_ACTION_CODE.EXCEEDS_AMOUNT_LIMIT
  ) {
    return PAYMENT_STATUS_REASON.INSUFFICIENT_FUNDS;
  }
  return PAYMENT_STATUS_REASON.CARD_DECLINED;
}
