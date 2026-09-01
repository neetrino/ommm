import { useCallback, useEffect, useRef } from "react";
import { Animated, Easing, type View as RNView } from "react-native";

const INDICATOR_DURATION_MS = 280;
const INDICATOR_EASING = Easing.bezier(0.4, 0, 0.2, 1);

type SlotOrigin = { x: number; y: number };

/**
 * Sliding cream chip behind the active tab icon.
 * Measures icon slots relative to the bar track, then animates translateX/Y.
 */
export function useTabBarIndicator(activeKey: string | undefined) {
  const barRef = useRef<RNView>(null);
  const iconSlotRefs = useRef<Record<string, RNView | null>>({});
  const slotOrigins = useRef<Record<string, SlotOrigin>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorY = useRef(new Animated.Value(0)).current;
  const hasPlacedIndicator = useRef(false);

  const moveIndicatorToKey = useCallback(
    (key: string, instant: boolean) => {
      const origin = slotOrigins.current[key];
      if (!origin) {
        return;
      }
      if (instant || !hasPlacedIndicator.current) {
        indicatorX.setValue(origin.x);
        indicatorY.setValue(origin.y);
        hasPlacedIndicator.current = true;
        return;
      }
      Animated.parallel([
        Animated.timing(indicatorX, {
          toValue: origin.x,
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorY, {
          toValue: origin.y,
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [indicatorX, indicatorY],
  );

  const measureIconSlot = useCallback(
    (key: string, isActive: boolean) => {
      const slot = iconSlotRefs.current[key];
      const bar = barRef.current;
      if (!slot || !bar) {
        return;
      }
      slot.measureLayout(
        bar,
        (x, y) => {
          slotOrigins.current[key] = { x, y };
          if (isActive) {
            moveIndicatorToKey(key, !hasPlacedIndicator.current);
          }
        },
        () => {
          // Retry happens on the next layout pass.
        },
      );
    },
    [moveIndicatorToKey],
  );

  const setIconSlotRef = useCallback((key: string, node: RNView | null) => {
    iconSlotRefs.current[key] = node;
  }, []);

  useEffect(() => {
    if (activeKey) {
      moveIndicatorToKey(activeKey, false);
    }
  }, [activeKey, moveIndicatorToKey]);

  return {
    barRef,
    indicatorX,
    indicatorY,
    setIconSlotRef,
    measureIconSlot,
  };
}
