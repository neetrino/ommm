import type { MeasureSphereGroundY } from "@/components/marketing/home/sphere-bounce-types";
import { PAYMENT_OUTCOME_SPHERE_BOUNCE } from "@/components/payment/payment-outcome-sphere-tokens";

const PAYMENT_SPHERE_STAGE_SELECTOR = "[data-payment-sphere-stage]";

/** Keeps the bounce inside the payment card logo stage. */
export const measurePaymentOutcomeSphereGroundY: MeasureSphereGroundY = (
  el,
  logicalY,
  reachPx,
) => {
  const stage = el.closest(PAYMENT_SPHERE_STAGE_SELECTOR);
  const rect = el.getBoundingClientRect();
  const restBottom = rect.bottom - logicalY;
  const maxDropPx = PAYMENT_OUTCOME_SPHERE_BOUNCE.maxDropPx;

  if (stage instanceof HTMLElement) {
    const stageRect = stage.getBoundingClientRect();
    const drop = Math.max(0, stageRect.bottom - restBottom + reachPx);
    return Math.min(maxDropPx, drop);
  }

  return maxDropPx;
};
