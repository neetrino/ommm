import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, useWindowDimensions } from "react-native";
import { COMPACT_CHROME_MAX_HEIGHT } from "../../../components/layout/screenChromeLayout";
import { SPLASH_SPHERE_BOUNCE } from "../splashSphereTokens";

const RISE_EASING = Easing.bezier(0.12, 0.84, 0.22, 1);
const FALL_EASING = Easing.in(Easing.quad);
const COMPACT_PEAK_RATIO = 0.4;

type SplashSphereMotion = {
  opacity: Animated.Value;
  translateY: Animated.Value;
  scaleX: Animated.Value;
  scaleY: Animated.Value;
};

export function useSplashSphereBounce(): SplashSphereMotion {
  const { width, height } = useWindowDimensions();
  const compact = width > height || height <= COMPACT_CHROME_MAX_HEIGHT;
  const peakPx = compact
    ? Math.round(SPLASH_SPHERE_BOUNCE.peakPx * COMPACT_PEAK_RATIO)
    : SPLASH_SPHERE_BOUNCE.peakPx;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    let loopAnim: Animated.CompositeAnimation | null = null;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) {
        return;
      }

      Animated.timing(opacity, {
        toValue: 1,
        duration: SPLASH_SPHERE_BOUNCE.fadeInMs,
        useNativeDriver: true,
      }).start();

      if (reduceMotion) {
        return;
      }

      const {
        riseMs,
        fallMs,
        squashMs,
        impactHoldMs,
        squashScaleX,
        squashScaleY,
        fadeInMs,
      } = SPLASH_SPHERE_BOUNCE;

      const squashDelayMs = Math.max(0, fallMs - squashMs);

      const bounceCycle = Animated.sequence([
        Animated.timing(translateY, {
          toValue: -peakPx,
          duration: riseMs,
          easing: RISE_EASING,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: fallMs,
            easing: FALL_EASING,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(squashDelayMs),
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
              Animated.timing(scaleX, {
                toValue: 1,
                duration: fadeInMs,
                useNativeDriver: true,
              }),
              Animated.timing(scaleY, {
                toValue: 1,
                duration: fadeInMs,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]);

      loopAnim = Animated.loop(bounceCycle);
      loopAnim.start();
    });

    return () => {
      cancelled = true;
      loopAnim?.stop();
      opacity.stopAnimation();
      translateY.stopAnimation();
      scaleX.stopAnimation();
      scaleY.stopAnimation();
    };
  }, [opacity, peakPx, scaleX, scaleY, translateY]);

  return { opacity, translateY, scaleX, scaleY };
}
