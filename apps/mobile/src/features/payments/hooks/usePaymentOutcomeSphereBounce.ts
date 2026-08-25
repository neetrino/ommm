import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";
import { PAYMENT_OUTCOME_SPHERE_BOUNCE } from "../paymentOutcomeTokens";

const RISE_EASING = Easing.bezier(0.12, 0.84, 0.22, 1);
const FALL_EASING = Easing.in(Easing.quad);

type PaymentOutcomeSphereMotion = {
  opacity: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
  scaleX: Animated.Value;
  scaleY: Animated.Value;
};

function randomPeakPx(): number {
  const { peakBasePx, peakBoostMinPx, peakBoostMaxPx } =
    PAYMENT_OUTCOME_SPHERE_BOUNCE;
  const boost =
    peakBoostMinPx + Math.random() * (peakBoostMaxPx - peakBoostMinPx);
  return Math.round(peakBasePx + boost);
}

function nextDriftX(currentX: number): number {
  const { driftPx, driftMaxPx } = PAYMENT_OUTCOME_SPHERE_BOUNCE;
  const delta = (Math.random() * 2 - 1) * driftPx;
  return Math.max(-driftMaxPx, Math.min(driftMaxPx, currentX + delta));
}

function randomStartDriftX(): number {
  const { driftPx, driftMaxPx } = PAYMENT_OUTCOME_SPHERE_BOUNCE;
  const spread = Math.min(driftMaxPx, driftPx * 1.25);
  return (Math.random() * 2 - 1) * spread;
}

/**
 * Payment-card sphere bounce — same cycle as web `HomeFooterSphereBounce`
 * with `PAYMENT_OUTCOME_SPHERE_BOUNCE` (fall → squash → rise + drift).
 */
export function usePaymentOutcomeSphereBounce(): PaymentOutcomeSphereMotion {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    let active: Animated.CompositeAnimation | null = null;
    let driftX = 0;

    const {
      fallMs,
      squashMs,
      impactHoldMs,
      riseMs,
      maxDropPx,
      squashScaleX,
      squashScaleY,
      riseStretchScaleX,
      riseStretchScaleY,
    } = PAYMENT_OUTCOME_SPHERE_BOUNCE;

    const riseLaunchMs = Math.round(riseMs * 0.28);
    const riseApexMs = Math.max(1, riseMs - riseLaunchMs);
    const groundY = maxDropPx;

    const runCycle = () => {
      if (cancelled) {
        return;
      }

      const peakPx = randomPeakPx();
      const endX = nextDriftX(driftX);

      active = Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: groundY,
            duration: fallMs,
            easing: FALL_EASING,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: endX,
            duration: fallMs,
            easing: FALL_EASING,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleX, {
            toValue: squashScaleX,
            duration: squashMs,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: squashScaleY,
            duration: squashMs,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(impactHoldMs),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -peakPx * 0.38,
            duration: riseLaunchMs,
            easing: RISE_EASING,
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: riseStretchScaleX,
            duration: riseLaunchMs,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: riseStretchScaleY,
            duration: riseLaunchMs,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -peakPx,
            duration: riseApexMs,
            easing: RISE_EASING,
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 1,
            duration: riseApexMs,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: 1,
            duration: riseApexMs,
            useNativeDriver: true,
          }),
        ]),
      ]);

      active.start(({ finished }) => {
        if (!finished || cancelled) {
          return;
        }
        driftX = endX;
        runCycle();
      });
    };

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) {
        return;
      }

      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();

      if (reduceMotion) {
        return;
      }

      driftX = randomStartDriftX();
      translateX.setValue(driftX);
      translateY.setValue(0);
      runCycle();
    });

    return () => {
      cancelled = true;
      active?.stop();
      opacity.stopAnimation();
      translateX.stopAnimation();
      translateY.stopAnimation();
      scaleX.stopAnimation();
      scaleY.stopAnimation();
    };
  }, [opacity, scaleX, scaleY, translateX, translateY]);

  return { opacity, translateX, translateY, scaleX, scaleY };
}
