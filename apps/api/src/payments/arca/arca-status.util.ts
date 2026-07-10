import {
  ARCA_PAYMENT_STATE,
  type ArcaOrderStatusResponse,
  type ArcaPaymentState,
} from './arca.types';

/** `orderStatus` codes returned by getOrderStatusExtended (Merchant Manual §7.1.5). */
export const ARCA_ORDER_STATUS = {
  CREATED: 0,
  APPROVED: 1,
  DEPOSITED: 2,
  REVERSED: 3,
  REFUNDED: 4,
  ACS_INITIATED: 5,
  DECLINED: 6,
} as const;

/** How a bank order maps onto our payment lifecycle. */
export type ArcaStatusEvaluation =
  | 'deposited'
  | 'failed'
  | 'in_progress'
  | 'unknown';

const NUMERIC_PAYMENT_STATE: Record<string, ArcaPaymentState> = {
  '0': ARCA_PAYMENT_STATE.CREATED,
  '1': ARCA_PAYMENT_STATE.APPROVED,
  '2': ARCA_PAYMENT_STATE.DEPOSITED,
  '3': ARCA_PAYMENT_STATE.DECLINED,
  '4': ARCA_PAYMENT_STATE.REVERSED,
  '5': ARCA_PAYMENT_STATE.REFUNDED,
};

const FINAL_FAILURE_STATES: ReadonlySet<ArcaPaymentState> = new Set([
  ARCA_PAYMENT_STATE.DECLINED,
  ARCA_PAYMENT_STATE.REVERSED,
  ARCA_PAYMENT_STATE.REFUNDED,
]);

const IN_PROGRESS_STATES: ReadonlySet<ArcaPaymentState> = new Set([
  ARCA_PAYMENT_STATE.CREATED,
  ARCA_PAYMENT_STATE.APPROVED,
]);

const FINAL_FAILURE_ORDER_STATUSES: ReadonlySet<number> = new Set([
  ARCA_ORDER_STATUS.REVERSED,
  ARCA_ORDER_STATUS.REFUNDED,
  ARCA_ORDER_STATUS.DECLINED,
]);

const IN_PROGRESS_ORDER_STATUSES: ReadonlySet<number> = new Set([
  ARCA_ORDER_STATUS.CREATED,
  ARCA_ORDER_STATUS.APPROVED,
  ARCA_ORDER_STATUS.ACS_INITIATED,
]);

/** Normalizes `paymentState` (string like `DEPOSITED` or numeric `2`) to a canonical value. */
export function normalizePaymentState(
  raw: string | number | undefined,
): ArcaPaymentState | undefined {
  if (raw === undefined || raw === null) {
    return undefined;
  }

  const value = String(raw).trim().toUpperCase();
  if (value in NUMERIC_PAYMENT_STATE) {
    return NUMERIC_PAYMENT_STATE[value];
  }

  return Object.values(ARCA_PAYMENT_STATE).find((state) => state === value);
}

/**
 * Decides how an Arca order maps onto our payment lifecycle.
 * Prefers explicit `paymentState`, falls back to `orderStatus`; both signals are checked
 * so a success/failure is never missed if the gateway only populates one of them.
 */
export function evaluateArcaOrderStatus(
  response: ArcaOrderStatusResponse,
): ArcaStatusEvaluation {
  const state = normalizePaymentState(
    response.paymentAmountInfo?.paymentState ?? response.paymentState,
  );
  const orderStatus =
    typeof response.orderStatus === 'number' ? response.orderStatus : undefined;

  if (
    state === ARCA_PAYMENT_STATE.DEPOSITED ||
    orderStatus === ARCA_ORDER_STATUS.DEPOSITED
  ) {
    return 'deposited';
  }

  if (
    (state !== undefined && FINAL_FAILURE_STATES.has(state)) ||
    (orderStatus !== undefined && FINAL_FAILURE_ORDER_STATUSES.has(orderStatus))
  ) {
    return 'failed';
  }

  if (
    (state !== undefined && IN_PROGRESS_STATES.has(state)) ||
    (orderStatus !== undefined && IN_PROGRESS_ORDER_STATUSES.has(orderStatus))
  ) {
    return 'in_progress';
  }

  return 'unknown';
}
